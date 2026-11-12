import gql from 'graphql-tag';
import {PlatformTypes} from '@/constants';
import debug from '@/utils/debug';
import twitch from '@/utils/twitch';
import {getPlatform} from '@/utils/window';

// mirrors the query twitch's own emote picker uses to decide whether to show its legendary emotes
// entrypoint. campaign is null on channels without legendary emotes
const LEGENDARY_EMOTE_SEASON_QUERY = gql`
  query BTTVLegendaryEmoteSeason($channelID: ID) {
    legendaryEmoteSeason(channelID: $channelID) {
      campaign {
        name
        imageURL
      }
      emotePool {
        isOwned
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

// null when the channel has no season. throws when the fetch fails, so a failure isn't taken for that
export async function fetchLegendaryEmoteSeason(channel) {
  if (getPlatform() !== PlatformTypes.TWITCH || channel?.provider !== 'twitch') {
    return null;
  }

  let season;
  try {
    const {data} = await twitch.graphqlQuery(LEGENDARY_EMOTE_SEASON_QUERY, {channelID: channel.id});
    season = data?.legendaryEmoteSeason;
  } catch (error) {
    debug.log('failed to fetch legendary emote season', error);
    throw error;
  }

  if (season?.campaign == null) {
    return null;
  }

  const emotePool = season.emotePool ?? [];
  const chestCounts = getChestCounts(season.userProgress?.chestInventory);

  return {
    channelId: channel.id,
    name: season.campaign.name,
    imageURL: season.campaign.imageURL,
    ownedCount: emotePool.filter(({isOwned}) => isOwned).length,
    totalCount: emotePool.length,
    chestCounts,
    unopenedChestCount: chestCounts.paidCount + chestCounts.ftueCount + chestCounts.freeCount,
    premiumChestCount: chestCounts.paidCount + chestCounts.ftueCount,
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
