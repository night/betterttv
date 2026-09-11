import {create} from 'zustand';
import {fetchGifs, getGifPickerContext} from '@/modules/emote_menu/utils/twitch-gifs';
import debug from '@/utils/debug';

// twitch's gif chat cooldown, also the ring indicator's full capacity
export const GIF_COOLDOWN_SECONDS = 30;

const useGifPickerStore = create(() => ({
  gifContext: null,
  gifs: [],
  loadingGifs: false,
  cooldownSecondsRemaining: 0,
}));

let lastContextFetch = null;
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

async function fetchContext(currentFetch) {
  const newGifContext = await getGifPickerContext();

  if (lastContextFetch !== currentFetch) {
    return;
  }

  useGifPickerStore.setState({gifContext: newGifContext?.available ? newGifContext : null});
}

export function fetchGifPickerContext() {
  useGifPickerStore.setState({gifContext: null});

  const currentFetch = {};
  lastContextFetch = currentFetch;
  currentFetch.promise = fetchContext(currentFetch);

  return currentFetch.promise;
}

async function fetchGifsForSearchTerm(currentFetch, searchTerm) {
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

export function updateGifResults(search = '') {
  const {gifContext} = useGifPickerStore.getState();
  if (gifContext == null || !gifContext.canSend || !gifContext.enabled) {
    return Promise.resolve();
  }

  useGifPickerStore.setState({gifs: [], loadingGifs: true});

  const currentFetch = {};
  lastGifsFetch = currentFetch;
  currentFetch.promise = fetchGifsForSearchTerm(currentFetch, search.trim());

  return currentFetch.promise;
}

export default useGifPickerStore;
