import {PlatformTypes} from '@/constants';
import {getCurrentChannel} from '@/utils/channel';
import debug from '@/utils/debug';
import twitch from '@/utils/twitch';
import {getPlatform} from '@/utils/window';

const GIPHY_API_BASE_URL = 'https://api.giphy.com/v1/gifs';
// fetch extra so the rating cap below can still fill the display limit
const GIFS_FETCH_LIMIT = 50;
const GIFS_LIMIT = 40;

// twitch's picker shows at most "pg" rated gifs regardless of the channel's
// configured content rating, so we never request or display above it
const GifRatingOrders = {y: 0, g: 1, pg: 2, 'pg-13': 3, r: 4};
const MAX_GIF_RATING = GifRatingOrders.pg;

// maps twitch's contentRating values to the giphy request rating. anything
// unrecognized requests "g"
const GifContentRatings = {
  PG_13: 'pg',
  G_PG: 'pg',
};

const GIF_ELIGIBLE_SUB_TIERS = ['2000', '3000'];

// twitch's own picker returns this from a send attempt while gifs are
// temporarily unavailable
const SEND_GIF_TEMPORARILY_UNAVAILABLE = -1;

export function getGifPickerContext() {
  if (getPlatform() !== PlatformTypes.TWITCH || getCurrentChannel()?.provider !== 'twitch') {
    return null;
  }

  // twitch mounts its gif picker controller with the chat and passes the
  // giphy config, the channel's subscription data and the send handler down
  // as props, so everything is read from there instead of our own requests
  const gifPicker = twitch.getGifPickerController();
  if (gifPicker == null) {
    return null;
  }

  const channelHasGifs = (gifPicker.channelData?.user?.subscriptionProducts ?? []).some((product) => product?.hasGifs);
  const subTier = gifPicker.channelData?.user?.self?.subscriptionBenefit?.tier;

  return {
    available:
      gifPicker.giphyFlags?.showKeyboard === true &&
      gifPicker.giphyIsAllowlisted === true &&
      gifPicker.giphyApiKey != null &&
      channelHasGifs,
    enabled: gifPicker.giphyIsEnabled === true,
    canSend: GIF_ELIGIBLE_SUB_TIERS.includes(subTier),
    apiKey: gifPicker.giphyApiKey,
    rating: GifContentRatings[gifPicker.giphyContentRating] ?? 'g',
    cooldownSecondsRemaining: gifPicker.gifCooldownSecondsRemaining ?? 0,
  };
}

function createGifFromGiphyRecord(gif, searchTerm) {
  const preview = gif.images?.fixed_height;
  const previewUrl = preview?.url;
  const url = gif.images?.original?.url;
  const width = Number(preview?.width) || 0;
  const height = Number(preview?.height) || 0;
  const title = gif.title?.trim();

  if (previewUrl == null || url == null || width === 0 || height === 0 || !title) {
    return null;
  }

  return {
    id: String(gif.id),
    title,
    previewUrl,
    previewWebpUrl: preview?.webp,
    url,
    searchTerm,
    width,
    height,
  };
}

export async function fetchGifs({apiKey, rating, searchTerm}) {
  const isSearch = searchTerm.length > 0;
  const url = new URL(`${GIPHY_API_BASE_URL}/${isSearch ? 'search' : 'trending'}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('limit', GIFS_FETCH_LIMIT.toString());
  url.searchParams.set('rating', rating);
  if (isSearch) {
    url.searchParams.set('q', searchTerm);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to fetch gifs: ${response.status}`);
  }

  const {data} = await response.json();
  return data
    .filter((gif) => {
      const gifRating = GifRatingOrders[(gif.rating ?? '').toLowerCase()];
      return !gif.is_ad && gifRating != null && gifRating <= MAX_GIF_RATING;
    })
    .map((gif) => createGifFromGiphyRecord(gif, searchTerm))
    .filter((gif) => gif != null)
    .slice(0, GIFS_LIMIT);
}

export async function sendGifMessage(gif) {
  const gifPicker = twitch.getGifPickerController();
  if (gifPicker == null) {
    return {success: false, temporarilyUnavailable: false, secondsUntilCanSend: 0};
  }

  try {
    // twitch's own send handler runs its mutation and records its cooldown,
    // and resolves with 0 on success, the remaining cooldown seconds, or -1
    const secondsUntilCanSend = (await gifPicker.onSelectGif(gif)) ?? 0;

    return {
      success: secondsUntilCanSend === 0,
      temporarilyUnavailable: secondsUntilCanSend === SEND_GIF_TEMPORARILY_UNAVAILABLE,
      secondsUntilCanSend: Math.max(0, secondsUntilCanSend),
    };
  } catch (error) {
    debug.log('failed to send gif message', error);
    return {success: false, temporarilyUnavailable: false, secondsUntilCanSend: 0};
  }
}
