import {EXT_VER, CDN_ENDPOINT} from '@/constants';

export default {
  url(path, breakCache = false) {
    // join with a single slash regardless of whether the caller's path has a leading one
    return `${CDN_ENDPOINT}/${path.replace(/^\/+/, '')}${breakCache ? `?v=${EXT_VER}` : ''}`;
  },

  emoteUrl(emoteId, version = '3x', static_ = false) {
    return this.url(`emote/${emoteId}${static_ ? '/static' : ''}/${version}.webp`);
  },
};
