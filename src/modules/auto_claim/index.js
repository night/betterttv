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

async function handleMessage(message) {
  const messageData = JSON.parse(message);

  if (
    messageData.type !== 'create-notification' ||
    messageData.data?.notification?.type !== 'user_drop_reward_reminder_notification'
  ) {
    return;
  }

  const {data} = await twitch.graphqlQuery(inventoryQuery);
  const {dropCampaignsInProgress} = data?.currentUser?.inventory ?? {};

  for await (const {timeBasedDrops, id: campaignId} of dropCampaignsInProgress) {
    for await (const drop of timeBasedDrops) {
      if (drop.self.isClaimed || drop.self.currentMinutesWatched < drop.requiredMinutesWatched) {
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

let listenerAttached = false;
class AutoClaimModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_CLAIM}`, () => this.load());
  }

  async load() {
    const autoClaim = settings.get(SettingIds.AUTO_CLAIM);
    const shouldAutoClaim = hasFlag(autoClaim, AutoClaimFlags.DROPS);
    const client = window.__twitch_pubsub_client;
    const currentUser = getCurrentUser();
    if (client == null || currentUser == null) {
      return;
    }
    const topicId = `onsite-notifications.${currentUser.id}`;
    if (!shouldAutoClaim && listenerAttached) {
      listenerAttached = false;
      client.topicListeners.removeListener(topicId, handleMessage);
    }
    if (shouldAutoClaim && !listenerAttached) {
      listenerAttached = true;
      client.topicListeners.addListener(topicId, handleMessage);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AutoClaimModule()]);
