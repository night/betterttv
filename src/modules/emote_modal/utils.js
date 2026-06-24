import {getEmoteDetails, searchSharedEmotes} from '@/actions/emotes';
import {EmoteAddDestinations, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';

export function addToLabel(destination) {
  return destination === EmoteAddDestinations.PERSONAL
    ? formatMessage({defaultMessage: 'Add to Personal'})
    : formatMessage({defaultMessage: 'Add to Channel'});
}

// maps an add mutation's state to the button's loader icon, so the spinner turns into a success or
// error icon while it settles (mirroring openConfirmModal's confirm button)
export function addLoaderType(mutation) {
  if (mutation.isSuccess) {
    return 'loaderIconSuccess';
  }
  if (mutation.isError) {
    return 'loaderIconError';
  }
  return 'loaderIconIndicator';
}

// react-query options for finding BetterTTV emotes that share an emote's code. Used to both prefetch
// the alternatives (before swapping to the alternatives page) and to render them, so they hit the
// same cache entry. A failed search degrades to "no alternatives" rather than erroring the page.
export function searchSharedEmotesQuery(code) {
  return {
    queryKey: ['shared-emote-search', code],
    queryFn: async () => {
      try {
        const response = await searchSharedEmotes(code);
        return Array.isArray(response) ? response : [];
      } catch {
        return [];
      }
    },
  };
}

// Resolves {createdAt, user} for the emote modal. BetterTTV is fetched from its API (the result is
// cached by react-query); 7TV and FrankerFaceZ data is captured on the emote when it's loaded.
export async function getEmoteModalDetails(emote) {
  const provider = emote.category?.provider;

  if (provider === EmoteProviders.BETTERTTV) {
    const details = await getEmoteDetails(emote.id).catch(() => null);
    return {createdAt: details?.createdAt ?? null, user: details?.user ?? null};
  }

  if (provider === EmoteProviders.SEVENTV) {
    const createdAt = emote.metadata?.createdAt;
    return {createdAt: createdAt != null ? new Date(createdAt).toISOString() : null, user: emote.channel ?? null};
  }

  return {createdAt: null, user: emote.channel ?? null};
}
