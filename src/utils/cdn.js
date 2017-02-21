const $ = require('jquery');
const debug = require('./debug');

const CDN_ENDPOINT = 'https://cdn.betterttv.net/';

module.exports = {
    url(path, breakCache = false) {
        return `${CDN_ENDPOINT}${path}${breakCache ? `?${debug.version}` : ''}`;
    },

    get(path, options) {
        return $.get(`${CDN_ENDPOINT}${path}`, options);
    }
};
