vars = require('./vars');

module.exports = {
    _setHeaders: function(options) {
        if (!options.headers) options.headers = {};

        options.headers['Client-ID'] = '6x8avioex0zt85ht6py4sq55z6avsea';

        if (vars.userData.isLoggedIn) {
            options.headers.Authorization = 'OAuth ' + vars.userData.oauthToken;
        }
    },
    _call: function(method, url, data, options) {
        if (!options) options = {};

        this._setHeaders(options);

        return window.Twitch.api[method].call(this, url, data, options);
    },
    get: function(url, data, options) {
        return this._call('get', url, data, options);
    },
    post: function(url, data, options) {
        return this._call('post', url, data, options);
    },
    put: function(url, data, options) {
        return this._call('put', url, data, options);
    },
    del: function(url, data, options) {
        return this._call('del', url, data, options);
    }
};
