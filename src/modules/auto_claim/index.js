import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import {AutoClaimFlags, PlatformTypes, SettingIds} from '../../constants.js';
import domObserver from '../../observers/dom.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

const PATCHED_SENTINEL = Symbol('patched symbol');
const ON_SITE_NOTIFICATION_SELECTOR = '.onsite-notifications-toast-manager';
const NOTIFICATION_NODE_TYPE = 'user_drop_reward_reminder_notification';

const inventoryQuery = gql`
  query BTTVInventory {
    currentUser {
      id
      inventory {
        dropCampaignsInProgress {
          id
          timeBasedDrops {
            id
            requiredMinutesWatched
            self {
              isClaimed
              currentMinutesWatched
              dropInstanceID
            }
          }
        }
      }
    }
  }
`;

const claimDropMutation = gql`
  mutation BTTVClaimDrop($input: ClaimDropRewardsInput!) {
    claimDropRewards(input: $input) {
      status
    }
  }
`;

async function handleClaim() {
  const {data} = await twitch.graphqlQuery(inventoryQuery);
  const {dropCampaignsInProgress} = data?.currentUser?.inventory ?? {};

  for await (const campaign of dropCampaignsInProgress) {
    const {timeBasedDrops} = campaign;
    for await (const drop of timeBasedDrops) {
      if (drop.self.isClaimed || drop.self.currentMinutesWatched < drop.requiredMinutesWatched) {
        continue;
      }
      let {dropInstanceID} = drop.self;
      if (dropInstanceID == null) {
        dropInstanceID = `${data.currentUser.id}#${campaign.id}#${drop.id}`;
      }
      try {
        await twitch.graphqlMutation(claimDropMutation, {input: {dropInstanceID}});
      } catch (_) {}
    }
  }
}

const handleClaimDebounced = debounce(handleClaim, 1000);

let twitchComponentDidUpdate = null;

let currentDate = new Date();

class AutoClaimModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_CLAIM}`, () => this.load());
    domObserver.on(ON_SITE_NOTIFICATION_SELECTOR, () => this.load());
  }

  async load() {
    const autoClaim = settings.get(SettingIds.AUTO_CLAIM);
    const shouldAutoClaim = hasFlag(autoClaim, AutoClaimFlags.DROPS);
    const store = twitch.getOnsiteNotificationStore();

    if (store == null) {
      return;
    }

    if (store?.__bttvOnsiteNotificationStorePatched === PATCHED_SENTINEL && !shouldAutoClaim) {
      delete store.__bttvOnsiteNotificationStorePatched;
      store.stateNode.componentDidUpdate = twitchComponentDidUpdate;
      store.stateNode.forceUpdate();
    }

    if (store?.__bttvOnsiteNotificationStorePatched !== PATCHED_SENTINEL && shouldAutoClaim) {
      if (store.pendingProps?.viewerListData == null) {
        store.pendingProps.stopDeferringViewer();
        await store.pendingProps.viewerLoadMore();
      }

      currentDate = new Date();
      store.__bttvOnsiteNotificationStorePatched = PATCHED_SENTINEL;
      twitchComponentDidUpdate = store.stateNode.componentDidUpdate;

      // eslint-disable-next-line no-inner-declarations
      function bttvComponentDidUpdate(...prevProps) {
        for (const props of prevProps) {
          if (props?.viewerListData == null) {
            continue;
          }
          const edges = props?.viewerListData?.currentUser?.notifications?.edges ?? [];
          for (const {node} of edges) {
            if (node.type !== NOTIFICATION_NODE_TYPE) {
              continue;
            }
            const createdAt = new Date(node.createdAt);
            if (createdAt.getTime() < currentDate.getTime()) {
              continue;
            }
            currentDate = createdAt;
            handleClaimDebounced();
          }
        }

        if (twitchComponentDidUpdate != null) {
          twitchComponentDidUpdate.call(this, ...prevProps);
        }
      }

      store.stateNode.componentDidUpdate = bttvComponentDidUpdate;
      store.stateNode.forceUpdate();
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoClaimModule()]);
