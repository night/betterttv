import {create} from 'zustand';
import {PlatformTypes} from '@/constants';
import {
  getOwnedEmoteIds,
  getTwitchAvailableEmotesVariables,
  LEGENDARY_EMOTE_SEASON_QUERY,
  parseLegendaryEmoteSeason,
  TWITCH_AVAILABLE_EMOTES_QUERY,
} from '@/modules/emote_menu/twitch/legendary-emotes';
import {getCurrentChannel} from '@/utils/channel';
import debug from '@/utils/debug';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import {getPlatform} from '@/utils/window';
import watcher from '@/watcher';

// a failed query isn't retried on every open, in case it keeps failing
const RETRY_DELAY = 60 * 1000;

const useLegendaryEmotesStore = create(() => ({
  // the current channel's season, or null when it has none (or it isn't known yet)
  season: null,
}));

// the season is followed in twitch's cache for one channel at a time, the same as twitch's own emote picker and
// collection view read it: twitch fetches it once per channel and keeps the chest counts current from pubsub
// (chests granted, and its decrement when one is opened). which emotes are owned comes from the viewer's emote
// sets in twitch's cache too (only read, never fetched), which twitch adds won emotes to
let watchedChannelId = null;
let unwatchSeason = null;
let unwatchEmoteSets = null;
let seasonData = null;
let ownedEmoteIds = new Set();
let failedAt = -Infinity;
let watchingChannelUpdates = false;

function setSeason(season) {
  if (useLegendaryEmotesStore.getState().season !== season) {
    useLegendaryEmotesStore.setState({season});
  }
}

function showSeason() {
  setSeason(watchedChannelId == null ? null : parseLegendaryEmoteSeason(watchedChannelId, seasonData, ownedEmoteIds));
}

// twitch has no season for viewers who aren't logged in (it skips the query), and only does this on twitch
function getWatchableChannelId() {
  const channel = getCurrentChannel();
  if (getPlatform() !== PlatformTypes.TWITCH || channel?.provider !== 'twitch' || getCurrentUser() == null) {
    return null;
  }

  return channel.id;
}

export function stopLegendaryEmoteSeason() {
  unwatchSeason?.();
  unwatchEmoteSets?.();
  unwatchSeason = null;
  unwatchEmoteSets = null;
  watchedChannelId = null;
  seasonData = null;
  ownedEmoteIds = new Set();
  failedAt = -Infinity;
  setSeason(null);
}

// the menu stays open across navigation, so the old channel's season goes with it. the new channel's is watched
// once the menu opens there, so channels it's never opened on cost nothing
function handleChannelUpdated() {
  if (getWatchableChannelId() !== watchedChannelId) {
    stopLegendaryEmoteSeason();
  }
}

function watchEmoteSets(channelId) {
  // cache-only, so a channel twitch hasn't loaded them for just doesn't add any
  unwatchEmoteSets = twitch.graphqlWatchQuery(
    TWITCH_AVAILABLE_EMOTES_QUERY,
    getTwitchAvailableEmotesVariables(channelId),
    {
      next: ({data}) => {
        if (watchedChannelId === channelId) {
          ownedEmoteIds = getOwnedEmoteIds(channelId, data);
          showSeason();
        }
      },
      error: (error) => debug.log('failed to watch twitch emote sets', error),
    },
    {fetchPolicy: 'cache-only'}
  );
}

function watchSeason(channelId) {
  let failed = false;
  const unwatch = twitch.graphqlWatchQuery(
    LEGENDARY_EMOTE_SEASON_QUERY,
    {channelID: channelId},
    {
      next: ({data}) => {
        if (watchedChannelId === channelId && data != null) {
          seasonData = data.legendaryEmoteSeason;
          showSeason();
        }
      },
      // the watch ends on an error, so the next open after a while watches again. what's shown stays
      error: (error) => {
        debug.log('failed to watch legendary emote season', error);
        failed = true;
        if (watchedChannelId === channelId) {
          unwatchSeason = null;
          failedAt = Date.now();
        }
      },
    }
  );
  // an error can also arrive before the watch is returned
  if (!failed) {
    unwatchSeason = unwatch;
  }
}

// runs whenever the emote menu opens
export function updateLegendaryEmoteSeason() {
  if (!watchingChannelUpdates) {
    watchingChannelUpdates = true;
    watcher.on('channel.updated', handleChannelUpdated);
  }

  const channelId = getWatchableChannelId();
  if (channelId !== watchedChannelId) {
    stopLegendaryEmoteSeason();
  }

  if (channelId == null) {
    return;
  }

  watchedChannelId = channelId;

  if (unwatchEmoteSets == null) {
    watchEmoteSets(channelId);
  }

  if (unwatchSeason == null && Date.now() - failedAt >= RETRY_DELAY) {
    watchSeason(channelId);
  }
}

export default useLegendaryEmotesStore;
