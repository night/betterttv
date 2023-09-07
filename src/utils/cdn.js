import {EXT_VER, CDN_ENDPOINT} from '../constants.js';

export default {
  url(path, breakCache = false) {
    return `${CDN_ENDPOINT}${path}${breakCache ? `?v=${EXT_VER}` : ''}`;
  },

  emoteUrl(emoteId, version = '3x', static_ = false) {
    return this.url(`emote/${emoteId}${static_ ? '/static' : ''}/${version}.webp`);
  },
};
