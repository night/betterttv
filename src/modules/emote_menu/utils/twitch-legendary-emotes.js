import gql from 'graphql-tag';
import {PlatformTypes} from '@/constants';
import {getCurrentChannel} from '@/utils/channel';
import debug from '@/utils/debug';
import twitch from '@/utils/twitch';
import {getPlatform} from '@/utils/window';

// mirrors the query twitch's own emote picker uses to decide whether to show its legendary emotes
// entrypoint. campaign is null on channels without legendary emotes
const LEGENDARY_EMOTE_SEASON_QUERY = gql`
  query BTTVLegendaryEmoteSeason($channelID: ID) {
    legendaryEmoteSeason(channelID: $channelID) {
      id
      campaign {
        id
        name
        imageURL
      }
      emotePool {
        tier
        isOwned
        emote {
          id
        }
      }
      userProgress {
        chestInventory {
          chestType
          unopenedCount
        }
      }
    }
  }
`;

// twitch's chat callout types for the legendary emotes collection and chest opening panels
const EMOTE_LEVELING_COLLECTION_CALLOUT_TYPE = 'emote-leveling-collection';
const EMOTE_LEVELING_CHEST_CALLOUT_TYPE = 'emote-leveling-chest';

const CALLOUT_SOURCE = {openSource: 'emote_picker', location: 'emote_picker'};

function generateCalloutId() {
  return crypto.randomUUID().replace(/-/g, '');
}

function getChestCounts(chestInventory) {
  const counts = {paidCount: 0, ftueCount: 0, freeCount: 0};
  for (const {chestType, unopenedCount} of chestInventory ?? []) {
    switch (chestType) {
      case 'PAID':
        counts.paidCount += unopenedCount;
        break;
      case 'FTUE':
        counts.ftueCount += unopenedCount;
        break;
      case 'FREE':
        counts.freeCount += unopenedCount;
        break;
      default:
        break;
    }
  }
  return counts;
}

export async function fetchLegendaryEmoteSeason() {
  const currentChannel = getCurrentChannel();
  if (getPlatform() !== PlatformTypes.TWITCH || currentChannel?.provider !== 'twitch') {
    return null;
  }

  let season;
  try {
    const {data} = await twitch.graphqlQuery(LEGENDARY_EMOTE_SEASON_QUERY, {channelID: currentChannel.id});
    season = data?.legendaryEmoteSeason;
  } catch (error) {
    debug.log('failed to fetch legendary emote season', error);
    return null;
  }

  if (season?.campaign == null) {
    return null;
  }

  const emotePool = season.emotePool ?? [];
  const chestCounts = getChestCounts(season.userProgress?.chestInventory);

  return {
    channelId: currentChannel.id,
    name: season.campaign.name,
    imageURL: season.campaign.imageURL,
    ownedCount: emotePool.filter(({isOwned}) => isOwned).length,
    totalCount: emotePool.length,
    chestCounts,
    unopenedChestCount: chestCounts.paidCount + chestCounts.ftueCount + chestCounts.freeCount,
    // twitch's entrypoint calls out premium chests when there are any, and free ones otherwise
    hasUnopenedPremiumChests: chestCounts.paidCount + chestCounts.ftueCount > 0,
  };
}

// opens twitch's own legendary emotes collection panel above the chat input, the same one its emote
// picker opens
export function openLegendaryEmotesCollection(channelId) {
  const calloutContext = twitch.getChatCalloutContext();
  if (calloutContext == null) {
    return false;
  }

  calloutContext.pushPriorityCallout({
    key: generateCalloutId(),
    event: {
      type: EMOTE_LEVELING_COLLECTION_CALLOUT_TYPE,
      channelID: channelId,
      takesFocus: true,
      source: CALLOUT_SOURCE,
      collectionSessionID: generateCalloutId(),
      isOpenTracked: false,
    },
  });

  return true;
}

// opens twitch's own chest opening panel for the viewer's unopened chests
export function openLegendaryEmoteChests(channelId, chestCounts) {
  const calloutContext = twitch.getChatCalloutContext();
  if (calloutContext == null) {
    return false;
  }

  calloutContext.pushPriorityCallout({
    key: generateCalloutId(),
    event: {
      type: EMOTE_LEVELING_CHEST_CALLOUT_TYPE,
      phase: 'prompt',
      privateCalloutSID: generateCalloutId(),
      channelID: channelId,
      ...chestCounts,
      origin: {kind: 'inventory'},
    },
  });

  return true;
}
