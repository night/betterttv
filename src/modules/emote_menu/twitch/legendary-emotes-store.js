import {create} from 'zustand';
import {PlatformTypes} from '@/constants';
import {LEGENDARY_EMOTE_SEASON_QUERY, parseLegendaryEmoteSeason} from '@/modules/emote_menu/twitch/legendary-emotes';
import {getCurrentChannel} from '@/utils/channel';
import debug from '@/utils/debug';
import twitch from '@/utils/twitch';
import {getPlatform} from '@/utils/window';
import watcher from '@/watcher';

// a failed query isn't retried on every open, in case it keeps failing
const RETRY_DELAY = 60 * 1000;

const useLegendaryEmotesStore = create(() => ({
  // the current channel's season, or null when it has none (or it isn't known yet)
  season: null,
}));

// the season is followed in twitch's cache for one channel at a time: twitch fetches it once per channel and
// keeps its counts current from pubsub (chests granted and opened), the same as for its own emote picker
let watchedChannelId = null;
let unwatch = null;
let failedAt = -Infinity;
let watchingChannelUpdates = false;

function setSeason(season) {
  if (useLegendaryEmotesStore.getState().season !== season) {
    useLegendaryEmotesStore.setState({season});
  }
}

function getTwitchChannelId() {
  const channel = getCurrentChannel();
  return getPlatform() === PlatformTypes.TWITCH && channel?.provider === 'twitch' ? channel.id : null;
}

function stopWatching() {
  unwatch?.();
  unwatch = null;
  watchedChannelId = null;
  failedAt = -Infinity;
  setSeason(null);
}

// the menu stays open across navigation, so the old channel's season goes with it. the new channel's is watched
// once the menu opens there, so channels it's never opened on cost nothing
function handleChannelUpdated() {
  if (getTwitchChannelId() !== watchedChannelId) {
    stopWatching();
  }
}

// runs whenever the emote menu opens
export function updateLegendaryEmoteSeason() {
  if (!watchingChannelUpdates) {
    watchingChannelUpdates = true;
    watcher.on('channel.updated', handleChannelUpdated);
  }

  const channelId = getTwitchChannelId();
  if (channelId !== watchedChannelId) {
    stopWatching();
  }

  if (channelId == null || unwatch != null || Date.now() - failedAt < RETRY_DELAY) {
    return;
  }

  watchedChannelId = channelId;
  let failed = false;
  const stop = twitch.graphqlWatchQuery(
    LEGENDARY_EMOTE_SEASON_QUERY,
    {channelID: channelId},
    {
      next: ({data}) => {
        if (watchedChannelId === channelId && data != null) {
          setSeason(parseLegendaryEmoteSeason(channelId, data.legendaryEmoteSeason));
        }
      },
      // the watch ends on an error, so the next open after a while watches again. what's shown stays
      error: (error) => {
        debug.log('failed to watch legendary emote season', error);
        failed = true;
        if (watchedChannelId === channelId) {
          unwatch = null;
          failedAt = Date.now();
        }
      },
    }
  );
  // an error can also arrive before the watch is returned
  if (!failed) {
    unwatch = stop;
  }
}

export default useLegendaryEmotesStore;
