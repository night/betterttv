import {EmoteAddDestinations, EmoteCategories, EmoteProviders} from '@/constants';
import formatMessage from '@/i18n/index';

// only BetterTTV emotes can be added, and emoji/global ones are already available everywhere
export function canAddEmote(emote) {
  return (
    emote.category?.provider === EmoteProviders.BETTERTTV &&
    emote.category?.id !== EmoteCategories.BETTERTTV_GLOBAL &&
    emote.category?.id !== EmoteCategories.BETTERTTV_EMOJI
  );
}

export function addToLabel(destination) {
  return destination === EmoteAddDestinations.PERSONAL
    ? formatMessage({defaultMessage: 'Add to Personal'})
    : formatMessage({defaultMessage: 'Add to Channel'});
}

export function addedToLabel(destination) {
  return destination === EmoteAddDestinations.PERSONAL
    ? formatMessage({defaultMessage: 'Added to Personal'})
    : formatMessage({defaultMessage: 'Added to Channel'});
}
