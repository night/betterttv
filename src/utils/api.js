const $ = require('jquery');

const API_ENDPOINT = 'https://api.betterttv.net/2/';

module.exports = {
    get(path, options) {
        return $.get(`${API_ENDPOINT}${path}`, options);
    }
};
