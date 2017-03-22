var store = require('./store');

module.exports = function() {
    if (bttv.settings.get('gwEmotes') === false) {
        return [];
    }

    var usableEmotes = [],
        emotes = store.gwEmotes;

    Object.keys(emotes).forEach(function(key) {
        var emote = emotes[key];

        if (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') !== true) {
            return;
        }

        usableEmotes.push({
            text: emote.code,
            channel: 'GameWisp Emotes',
            badge: 'https://d32y8axfzs6sv8.cloudfront.net/static/gamewisp_transparent_18px.png',
            url: emote.url
        });
    });

    return usableEmotes;
};
