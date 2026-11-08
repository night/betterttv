import gql from 'graphql-tag';
import {SettingIds, ChannelPointsFlags, PlatformTypes} from '@/constants';
import settings from '@/settings';
import {getCurrentChannel} from '@/utils/channel';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
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
  return twitch.graphqlMutation(claimCommunityPointsMutation, {input: {channelID, claimID}});
}

function handlePubSubNotification(event) {
  let message;
  try {
    message = JSON.parse(event.detail);
  } catch (_) {
    return;
  }

  if (message?.type !== 'claim-available') return;

  const {id, channel_id: channelId} = message.data.claim;
  claimCommunityPoints(channelId, id).catch(() => {});
}

async function claimAvailableBonus() {
  const channel = getCurrentChannel();
  if (channel == null || !isAutoClaimEnabled()) return;

  const {data} = await twitch.graphqlQuery(availableClaimQuery, {channelID: channel.id});
  const claimId = data?.channel?.self?.communityPoints?.availableClaim?.id;
  if (claimId == null) return;

  await claimCommunityPoints(channel.id, claimId);
}

class ChannelPoints {
  constructor() {
    this.loadAutoClaimBonusChannelPoints();
    this.loadHideChannelPoints();

    watcher.on('load.chat', () => this.loadAutoClaimBonusChannelPoints());
    watcher.on('channel.updated', () => claimAvailableBonus().catch(() => {}));
    settings.on(`changed.${SettingIds.CHANNEL_POINTS}`, () => {
      this.loadAutoClaimBonusChannelPoints();
      this.loadHideChannelPoints();
    });
  }

  loadAutoClaimBonusChannelPoints() {
    if (!isAutoClaimEnabled()) {
      removePubSubListener?.();
      removePubSubListener = null;
      return;
    }

    const twitchPubSubEvents = window.__twitch_pubsub_events;
    if (removePubSubListener != null || twitchPubSubEvents == null) return;

    twitchPubSubEvents.addEventListener('notification', handlePubSubNotification);
    removePubSubListener = () => twitchPubSubEvents.removeEventListener('notification', handlePubSubNotification);
  }

  loadHideChannelPoints() {
    document.body.classList.toggle(
      'bttv-hide-channel-points',
      !hasFlag(settings.get(SettingIds.CHANNEL_POINTS), ChannelPointsFlags.CHANNEL_POINTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChannelPoints()]);
