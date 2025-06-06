import gql from 'graphql-tag';
import {AutoClaimFlags, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import {getCurrentUser} from '../../utils/user.js';
import watcher from '../../watcher.js';

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
              hasPreconditionsMet
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

async function handleOnsiteNotificationMessage(message) {
  const messageData = JSON.parse(message);

  if (
    messageData.type !== 'create-notification' ||
    messageData.data?.notification?.type !== 'user_drop_reward_reminder_notification'
  ) {
    return;
  }

  const {data} = await twitch.graphqlQuery(inventoryQuery, {}, {fetchPolicy: 'no-cache'});
  const {dropCampaignsInProgress} = data?.currentUser?.inventory ?? {};

  for await (const {timeBasedDrops, id: campaignId} of dropCampaignsInProgress) {
    for await (const drop of timeBasedDrops) {
      if (
        drop.self.isClaimed ||
        drop.self.currentMinutesWatched < drop.requiredMinutesWatched ||
        !drop.self.hasPreconditionsMet
      ) {
        continue;
      }
      let {dropInstanceID} = drop.self;
      if (dropInstanceID == null) {
        dropInstanceID = `${data.currentUser.id}#${campaignId}#${drop.id}`;
      }
      try {
        await twitch.graphqlMutation(claimDropMutation, {input: {dropInstanceID}});
      } catch (_) {}
    }
  }
}

let unlisten = null;
class AutoClaimModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_CLAIM}`, () => this.load());
  }

  async load() {
    const autoClaim = settings.get(SettingIds.AUTO_CLAIM);
    const shouldAutoClaim = hasFlag(autoClaim, AutoClaimFlags.DROPS);

    if (!shouldAutoClaim && unlisten != null) {
      unlisten?.();
      unlisten = null;
    }

    if (shouldAutoClaim && unlisten == null) {
      const connectStore = twitch.getConnectStore();
      const currentUser = getCurrentUser();
      const client = window.__twitch_pubsub_client;

      if (connectStore == null || currentUser == null || client == null) {
        return;
      }

      const sessionUserAuthToken = connectStore.getState()?.session?.user?.authToken;
      if (sessionUserAuthToken == null) {
        return;
      }

      unlisten = client.listen(
        {topic: `onsite-notifications.${currentUser.id}`, auth: sessionUserAuthToken},
        handleOnsiteNotificationMessage
      );
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoClaimModule()]);
