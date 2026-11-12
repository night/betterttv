import gql from 'graphql-tag';
import twitch from '@/utils/twitch';

// twitch's own legendaryEmoteSeason query, field for field: it's read from and kept in twitch's cache (see
// twitch.graphqlWatchQuery), where twitch updates it from pubsub as chests are granted and opened, so the
// selection has to match what twitch writes there. campaign is null on channels without legendary emotes
export const LEGENDARY_EMOTE_SEASON_QUERY = gql`
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
          token
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

// the season as the emote menu shows it, from the query's data. null when the channel has none
export function parseLegendaryEmoteSeason(channelId, season) {
  if (season?.campaign == null) {
    return null;
  }

  const emotePool = season.emotePool ?? [];
  const chestCounts = getChestCounts(season.userProgress?.chestInventory);

  return {
    channelId,
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
