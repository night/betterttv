import gql from 'graphql-tag';
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

const SendGifMessageErrors = {
  TEMPORARILY_UNAVAILABLE: 'TEMPORARILY_UNAVAILABLE',
};

const GIF_PICKER_CONTEXT_QUERY = gql`
  query BTTVGifPickerContext($channelID: ID!) {
    gifPickerConfig(channelID: $channelID) {
      isEnabled
      isAllowlisted
      apiKey
      contentRating
    }
    user(id: $channelID) {
      id
      subscriptionProducts {
        id
        hasGifs
      }
      self {
        subscriptionBenefit {
          id
          tier
        }
      }
    }
  }
`;

const SEND_GIF_MESSAGE_MUTATION = gql`
  mutation BTTVSendGifMessage($input: SendGifMessageInput!) {
    sendGifMessage(input: $input) {
      error
      secondsUntilCanSend
      message {
        id
      }
    }
  }
`;

export async function getGifPickerContext() {
  const currentChannel = getCurrentChannel();
  if (getPlatform() !== PlatformTypes.TWITCH || currentChannel?.provider !== 'twitch') {
    return null;
  }

  try {
    // relies on the twitch apollo client's cache, so reopening the menu on the
    // same channel doesn't refetch
    const {data} = await twitch.graphqlQuery(GIF_PICKER_CONTEXT_QUERY, {channelID: currentChannel.id});
    const config = data?.gifPickerConfig;
    const channelHasGifs = (data?.user?.subscriptionProducts ?? []).some((product) => product?.hasGifs);
    const subTier = data?.user?.self?.subscriptionBenefit?.tier;

    return {
      available: config?.isAllowlisted === true && config?.apiKey != null && channelHasGifs,
      enabled: config?.isEnabled === true,
      canSend: GIF_ELIGIBLE_SUB_TIERS.includes(subTier),
      apiKey: config?.apiKey,
      rating: GifContentRatings[config?.contentRating] ?? 'g',
    };
  } catch (error) {
    debug.log('failed to query gif picker config', error);
    return null;
  }
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
  const currentChannel = getCurrentChannel();
  if (currentChannel == null) {
    return {success: false, temporarilyUnavailable: false, secondsUntilCanSend: 0};
  }

  try {
    const {data} = await twitch.graphqlMutation(SEND_GIF_MESSAGE_MUTATION, {
      input: {
        channelID: currentChannel.id,
        gifID: gif.id,
        gifURL: gif.url,
        searchTerm: gif.searchTerm.length > 0 ? gif.searchTerm : undefined,
      },
    });

    const result = data?.sendGifMessage;
    if (result?.error != null) {
      return {
        success: false,
        temporarilyUnavailable: result.error === SendGifMessageErrors.TEMPORARILY_UNAVAILABLE,
        secondsUntilCanSend: result.secondsUntilCanSend ?? 0,
      };
    }

    return {success: true, secondsUntilCanSend: result?.secondsUntilCanSend ?? 0};
  } catch (error) {
    debug.log('failed to send gif message', error);
    return {success: false, temporarilyUnavailable: false, secondsUntilCanSend: 0};
  }
}
