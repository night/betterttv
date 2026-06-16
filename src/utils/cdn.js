import {EXT_VER, CDN_ENDPOINT} from '@/constants';

export default {
  url(path, breakCache = false) {
    // CDN_ENDPOINT ends with `/`, so strip any leading slash from the path to avoid `//`
    return `${CDN_ENDPOINT}${path.replace(/^\/+/, '')}${breakCache ? `?v=${EXT_VER}` : ''}`;
  },

  emoteUrl(emoteId, version = '3x', static_ = false) {
    return this.url(`emote/${emoteId}${static_ ? '/static' : ''}/${version}.webp`);
  },
};
