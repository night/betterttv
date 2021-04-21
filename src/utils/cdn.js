import $ from 'jquery';
import debug from './debug.js';

const {CDN_ENDPOINT} = process.env;

export default {
  url(path, breakCache = false) {
    return `${CDN_ENDPOINT}${path}${breakCache ? `?v=${debug.version}` : ''}`;
  },

  emoteUrl(emoteId, version = '3x') {
    return this.url(`emote/${emoteId}/${version}`);
  },

  get(path, options) {
    return $.get(`${CDN_ENDPOINT}${path}`, options);
  },
};
