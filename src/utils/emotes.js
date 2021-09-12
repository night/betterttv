import {emotesCategoryIds} from '../constants.js';

/* eslint-disable import/prefer-default-export */
export function getEmoteIdFromProvider(emoteId, providerId) {
  switch (true) {
    case providerId.startsWith('emoji'):
    case providerId.startsWith('bttv'):
      return `${emotesCategoryIds.BETTERTTV}-${emoteId}`;
    case providerId.startsWith('ffz'):
      return `${emotesCategoryIds.FRANKERFACEZ}-${emoteId}`;
    default:
  }

  switch (providerId) {
    case emotesCategoryIds.FAVORITES:
    case emotesCategoryIds.FRECENTS:
      return String(emoteId);
    default:
  }

  return `${providerId}-${emoteId}`;
}
