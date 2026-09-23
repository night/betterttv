import debounce from 'lodash.debounce';
import {create} from 'zustand';
import {ChatFlags, SettingIds} from '@/constants';
import {fetchGifs, getGifPickerContext} from '@/modules/emote_menu/utils/twitch-gifs';
import settings from '@/settings';
import debug from '@/utils/debug';
import {hasFlag} from '@/utils/flags';

const UPDATE_GIF_RESULTS_DEBOUNCE_MS = 300;

// twitch's gif chat cooldown, also the ring indicator's full capacity
export const GIF_COOLDOWN_SECONDS = 30;

const useGifPickerStore = create(() => ({
  gifContext: null,
  gifs: [],
  loadingGifs: false,
  cooldownSecondsRemaining: 0,
}));

let lastGifsFetch = null;
let cooldownInterval = null;

export function startGifCooldown(totalSeconds) {
  clearInterval(cooldownInterval);
  const expiresAt = Date.now() + totalSeconds * 1000;
  useGifPickerStore.setState({cooldownSecondsRemaining: totalSeconds});

  cooldownInterval = setInterval(() => {
    const secondsRemaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    useGifPickerStore.setState({cooldownSecondsRemaining: secondsRemaining});
    if (secondsRemaining === 0) {
      clearInterval(cooldownInterval);
    }
  }, 1000);
}

export function updateGifPickerContext() {
  const newGifContext = getGifPickerContext();
  useGifPickerStore.setState({gifContext: newGifContext?.available ? newGifContext : null});

  // twitch persists its per-channel cooldown, so a reopen or reload picks it up
  const {cooldownSecondsRemaining} = useGifPickerStore.getState();
  if (newGifContext != null && newGifContext.cooldownSecondsRemaining > cooldownSecondsRemaining) {
    startGifCooldown(newGifContext.cooldownSecondsRemaining);
  }
}

async function fetchAndStoreGifs(currentFetch, searchTerm) {
  const {gifContext} = useGifPickerStore.getState();

  let gifs = [];
  try {
    gifs = await fetchGifs({apiKey: gifContext.apiKey, rating: gifContext.rating, searchTerm});
  } catch (error) {
    debug.log('failed to fetch gifs', error);
  }

  if (lastGifsFetch !== currentFetch) {
    return;
  }

  useGifPickerStore.setState({gifs, loadingGifs: false});
}

function startGifsFetch(search) {
  const currentFetch = {};
  lastGifsFetch = currentFetch;
  currentFetch.promise = fetchAndStoreGifs(currentFetch, search.trim());
  return currentFetch.promise;
}

const startGifsFetchDebounced = debounce(startGifsFetch, UPDATE_GIF_RESULTS_DEBOUNCE_MS);

function canUpdateGifResults() {
  const {gifContext} = useGifPickerStore.getState();
  return (
    gifContext != null &&
    gifContext.canSend &&
    gifContext.enabled &&
    hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_GIFS)
  );
}

export function updateGifResults(search = '') {
  if (!canUpdateGifResults()) {
    return Promise.resolve();
  }

  startGifsFetchDebounced.cancel();
  useGifPickerStore.setState({gifs: [], loadingGifs: true});
  return startGifsFetch(search);
}

export function updateGifResultsDebounced(search) {
  if (!canUpdateGifResults()) {
    return;
  }

  // the loading indicator starts immediately, only the fetch is debounced.
  // clearing the token here keeps an in-flight fetch from landing stale
  // results while the debounce waits
  lastGifsFetch = null;
  useGifPickerStore.setState({gifs: [], loadingGifs: true});
  startGifsFetchDebounced(search);
}

export function cancelGifResultsUpdate() {
  startGifsFetchDebounced.cancel();
}

export default useGifPickerStore;
