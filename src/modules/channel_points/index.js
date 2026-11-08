import gql from 'graphql-tag';
import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import settings from '@/settings';
import {getCurrentChannel} from '@/utils/channel';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import watcher from '@/watcher';

const availableClaimQuery = gql`
  query BTTVAvailableClaim($channelID: ID!) {
    channel(id: $channelID) {
      id
      self {
        communityPoints {
          availableClaim {
            id
          }
        }
      }
    }
  }
`;

const claimCommunityPointsMutation = gql`
  mutation BTTVClaimCommunityPoints($input: ClaimCommunityPointsInput!) {
    claimCommunityPoints(input: $input) {
      error {
        code
      }
    }
  }
`;

let removePubSubListener = null;

function isAutoClaimEnabled() {
  return hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.AUTO_CLAIM);
}

function claimCommunityPoints(channelID, claimID) {
  twitch.graphqlMutation(claimCommunityPointsMutation, {input: {channelID, claimID}}).catch(() => {});
}

async function claimAvailableBonus() {
  const channel = getCurrentChannel();
  if (channel == null || getCurrentUser() == null) {
    return;
  }

  const {data} = await twitch.graphqlQuery(availableClaimQuery, {channelID: channel.id});
  const claimID = data?.channel?.self?.communityPoints?.availableClaim?.id;
  if (claimID == null) {
    return;
  }

  claimCommunityPoints(channel.id, claimID);
}

function handlePubSubNotification(event) {
  let message;
  try {
    message = JSON.parse(event.detail);
  } catch (_) {
    return;
  }

  if (message?.type !== 'claim-available') {
    return;
  }

  const {id: claimID, channel_id: channelID} = message.data.claim;
  claimCommunityPoints(channelID, claimID);
}

class ChannelPoints {
  constructor() {
    this.loadAutoClaimBonusChannelPoints();
    this.loadHideChannelPoints();

    watcher.on('load.chat', () => this.loadAutoClaimBonusChannelPoints());
    settings.on(`changed.${SettingIds.CHANNEL_POINTS}`, () => {
      this.loadAutoClaimBonusChannelPoints(true);
      this.loadHideChannelPoints();
    });
  }

  loadAutoClaimBonusChannelPoints(shouldClaimAvailableBonus = false) {
    if (!isAutoClaimEnabled()) {
      removePubSubListener?.();
      removePubSubListener = null;
      return;
    }

    const twitchPubSubEvents = window.__twitch_pubsub_events;
    if (removePubSubListener != null || twitchPubSubEvents == null) {
      return;
    }

    twitchPubSubEvents.addEventListener('notification', handlePubSubNotification);
    removePubSubListener = () => twitchPubSubEvents.removeEventListener('notification', handlePubSubNotification);

    if (!shouldClaimAvailableBonus) {
      return;
    }

    claimAvailableBonus().catch(() => {});
  }

  loadHideChannelPoints() {
    document.body.classList.toggle(
      'bttv-hide-channel-points',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.CHANNEL_POINTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChannelPoints()]);
