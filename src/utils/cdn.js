import debug from './debug.js';

const {CDN_ENDPOINT} = process.env;

export default {
  url(path, breakCache = false) {
    return `${CDN_ENDPOINT}${path}${breakCache ? `?v=${debug.version}` : ''}`;
  },

  emoteUrl(emoteId, version = '3x', static_ = false) {
    return this.url(`emote/${emoteId}${static_ ? '/static' : ''}/${version}.webp`);
  },
};
