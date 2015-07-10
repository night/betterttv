module.exports = {
    _ref: null,
    _headers: function(e, t) {
        e.setRequestHeader("Client-ID", "6x8avioex0zt85ht6py4sq55z6avsea");

        bttv.TwitchAPI._ref.call(Twitch.api, e, t);
    },
    _call: function(method, url, data, options) {
        // Replace Twitch's beforeSend with ours (to add Client ID)
        var rep = this._takeover();

        var callTwitchAPI = window.Twitch.api[method].call(this, url, data, options);

        // Replace Twitch's beforeSend back with theirs
        this._untakeover();

        return callTwitchAPI;
    },
    _takeover: function() {
        if(!window.Twitch.api._beforeSend) return;

        this._ref = window.Twitch.api._beforeSend;

        window.Twitch.api._beforeSend = this._headers;
    },
    _untakeover: function() {
        if(!this._ref) return;

        window.Twitch.api._beforeSend = this._ref;
        this._ref = null;
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