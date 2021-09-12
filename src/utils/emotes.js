import {emotesCategoryIds} from '../constants.js';

/* eslint-disable import/prefer-default-export */
export function getEmoteIdFromProvider(emoteId, providerId) {
  if (providerId === emotesCategoryIds.FAVORITES || providerId === emotesCategoryIds.FRECENTS) {
    throw new Error('provider type cannot be of type favorites nor frecents.');
  }

  switch (true) {
    case providerId.startsWith('emoji'):
    case providerId.startsWith('bttv'):
      return `${emotesCategoryIds.BETTERTTV}-${emoteId}`;
    case providerId.startsWith('ffz'):
      return `${emotesCategoryIds.FRANKERFACEZ}-${emoteId}`;
    default:
  }

  return `${providerId}-${emoteId}`;
}
