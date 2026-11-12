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

// twitch's own query for the viewer's emote sets, field for field and with its variables (see
// getTwitchAvailableEmotesVariables). twitch keeps it watched with chat, and adds emotes to it when it's told they
// were granted, which isn't always right after a chest is opened (the same for twitch's own collection view).
// it's only ever read from twitch's cache, never fetched
export const TWITCH_AVAILABLE_EMOTES_QUERY = gql`
  query AvailableEmotesForChannelPaginated($channelID: ID!, $withOwner: Boolean!, $pageLimit: Int!, $cursor: Cursor) {
    channel(id: $channelID) {
      id
      self {
        id
        availableEmoteSetsPaginated(pageLimit: $pageLimit, after: $cursor) {
          edges {
            ...EmoteSetsEdgeFragment
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  }

  fragment EmoteSetsEdgeFragment on EmoteSetsEdge {
    cursor
    node {
      id
      emotes {
        id
        setID
        token
        modifiers {
          code
          name
        }
        type
        assetType
      }
      owner @include(if: $withOwner) {
        id
        login
        displayName
        profileImageURL(width: 28)
      }
    }
  }
`;

// what twitch caches the query under: its pages are merged into the first one, which has no cursor
export function getTwitchAvailableEmotesVariables(channelId) {
  return {channelID: channelId, withOwner: true, pageLimit: 350};
}

// the ids of the emotes in the viewer's emote sets, from TWITCH_AVAILABLE_EMOTES_QUERY's data for this channel
export function getOwnedEmoteIds(channelId, data) {
  const ids = new Set();
  if (data?.channel?.id !== channelId) {
    return ids;
  }

  for (const edge of data.channel.self?.availableEmoteSetsPaginated?.edges ?? []) {
    for (const emote of edge?.node?.emotes ?? []) {
      if (emote?.id != null) {
        ids.add(emote.id);
      }
    }
  }

  return ids;
}

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

// the season as the emote menu shows it, from the query's data. null when the channel has none. the season's
// isOwned isn't updated as chests are opened, so like twitch's collection view, an emote also counts as owned
// once it's in the viewer's emote sets
export function parseLegendaryEmoteSeason(channelId, season, ownedEmoteIds = new Set()) {
  if (season?.campaign == null) {
    return null;
  }

  // as twitch's collection view counts them, leaving out entries without an emote
  const emotePool = (season.emotePool ?? []).filter(({emote}) => emote?.id != null && emote?.token != null);
  const chestCounts = getChestCounts(season.userProgress?.chestInventory);

  return {
    channelId,
    name: season.campaign.name,
    imageURL: season.campaign.imageURL,
    ownedCount: emotePool.filter(({isOwned, emote}) => isOwned || ownedEmoteIds.has(emote?.id)).length,
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
