import {create} from 'zustand';
import {fetchLegendaryEmoteSeason} from '@/modules/emote_menu/twitch/legendary-emotes';
import {getCurrentChannel} from '@/utils/channel';
import watcher from '@/watcher';

// most channels have no season, and one rarely starts mid-session, so that's checked again only after a while
const NO_SEASON_MAX_AGE = 30 * 60 * 1000;
// a season's owned and chest counts change as the viewer earns emotes, so they're refreshed on open once
// they're this old
const SEASON_MAX_AGE = 60 * 1000;
// a failed fetch isn't taken for "no season", but isn't retried on every open either, in case it keeps failing
const RETRY_DELAY = 60 * 1000;
// the cache only needs the channels visited recently
const MAX_CACHED_CHANNELS = 20;

const useLegendaryEmotesStore = create(() => ({
  // the current channel's season, or null when it has none (or it isn't known yet)
  season: null,
}));

// channel id -> {season, fetchedAt}; a season of null means the channel has none
const seasons = new Map();
// channel id -> the fetch in flight, so opening the menu again while it's loading doesn't fetch twice
const pendingFetches = new Map();
// channel id -> when its last fetch failed
const failedAt = new Map();
// channel id -> when the viewer last opened twitch's collection or chest panel there
const invalidatedAt = new Map();
let watchingChannel = false;

function isFresh(entry) {
  const maxAge = entry.season == null ? NO_SEASON_MAX_AGE : SEASON_MAX_AGE;
  return Date.now() - entry.fetchedAt < maxAge;
}

function cacheSeason(channelId, season, startedAt) {
  // counts fetched before the viewer opened a panel may already be out of date, so the next open fetches again
  const invalidated = (invalidatedAt.get(channelId) ?? -Infinity) >= startedAt;
  invalidatedAt.delete(channelId);

  seasons.delete(channelId);
  seasons.set(channelId, {season, fetchedAt: invalidated ? 0 : Date.now()});

  if (seasons.size > MAX_CACHED_CHANNELS) {
    seasons.delete(seasons.keys().next().value);
  }
}

function showSeasonForCurrentChannel() {
  const channelId = getCurrentChannel()?.id;
  const season = channelId == null ? null : (seasons.get(channelId)?.season ?? null);
  if (useLegendaryEmotesStore.getState().season !== season) {
    useLegendaryEmotesStore.setState({season});
  }
}

// runs whenever the emote menu opens: shows what's known for this channel straight away, and fetches only
// when that's missing or stale
export function updateLegendaryEmoteSeason() {
  if (!watchingChannel) {
    watchingChannel = true;
    // the menu stays open across navigation, so drop the old channel's season instead of showing it on
    // this one
    watcher.on('channel.updated', showSeasonForCurrentChannel);
  }

  showSeasonForCurrentChannel();

  const channel = getCurrentChannel();
  if (channel == null) {
    return;
  }

  const {id: channelId} = channel;
  const entry = seasons.get(channelId);
  if ((entry != null && isFresh(entry)) || pendingFetches.has(channelId)) {
    return;
  }

  if (Date.now() - (failedAt.get(channelId) ?? -Infinity) < RETRY_DELAY) {
    return;
  }

  const startedAt = Date.now();
  const pendingFetch = fetchLegendaryEmoteSeason(channel)
    .then((season) => {
      failedAt.delete(channelId);
      cacheSeason(channelId, season, startedAt);
      // the viewer may have moved to another channel while this loaded
      showSeasonForCurrentChannel();
    })
    // a failed fetch keeps what's cached (it isn't taken for "no season"), and is retried after a while
    .catch(() => failedAt.set(channelId, Date.now()))
    .finally(() => pendingFetches.delete(channelId));

  pendingFetches.set(channelId, pendingFetch);
}

// the viewer opened twitch's collection or chest panel, where the counts can change, so the next open
// fetches them again, including when a fetch that started before this is still loading
export function invalidateLegendaryEmoteSeason(channelId) {
  invalidatedAt.set(channelId, Date.now());

  const entry = seasons.get(channelId);
  if (entry != null) {
    entry.fetchedAt = 0;
  }
}

export default useLegendaryEmotesStore;
