import {create} from 'zustand';
import {PlatformTypes} from '@/constants';
import {LEGENDARY_EMOTE_SEASON_QUERY, parseLegendaryEmoteSeason} from '@/modules/emote_menu/twitch/legendary-emotes';
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

// the season is followed in twitch's cache for one channel at a time: twitch fetches it once per channel and
// keeps the chest counts current from pubsub (chests granted, and its optimistic decrement when one is opened),
// the same as for its own emote picker
let watchedChannelId = null;
let watch = null;
let failedAt = -Infinity;
// twitch never updates which emotes are owned after a chest opened in this tab (its own picker doesn't show
// that count), so a drop in unopened chests marks the season to be fetched again on the next open
let chestsOpened = false;
let watchingChannelUpdates = false;

function setSeason(season) {
  const {season: currentSeason} = useLegendaryEmotesStore.getState();
  if (currentSeason === season) {
    return;
  }

  if (currentSeason != null && season != null && season.unopenedChestCount < currentSeason.unopenedChestCount) {
    chestsOpened = true;
  }

  useLegendaryEmotesStore.setState({season});
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
  watch?.unsubscribe();
  watch = null;
  watchedChannelId = null;
  failedAt = -Infinity;
  chestsOpened = false;
  setSeason(null);
}

// the menu stays open across navigation, so the old channel's season goes with it. the new channel's is watched
// once the menu opens there, so channels it's never opened on cost nothing
function handleChannelUpdated() {
  if (getWatchableChannelId() !== watchedChannelId) {
    stopLegendaryEmoteSeason();
  }
}

function refetchOwnedEmotes() {
  chestsOpened = false;
  // the result goes through the cache to the watch. a failure ends the watch (see error below), and a later
  // open fetches it again
  watch.refetch().catch(() => {
    chestsOpened = true;
  });
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

  if (watch != null) {
    if (chestsOpened) {
      refetchOwnedEmotes();
    }
    return;
  }

  if (Date.now() - failedAt < RETRY_DELAY) {
    return;
  }

  watchedChannelId = channelId;
  let failed = false;
  const newWatch = twitch.graphqlWatchQuery(
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
          watch = null;
          failedAt = Date.now();
        }
      },
    }
  );
  // an error can also arrive before the watch is returned
  if (!failed) {
    watch = newWatch;
  }
}

export default useLegendaryEmotesStore;
