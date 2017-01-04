var store = require('./store');

module.exports = function() {
    if (bttv.settings.get('gwEmotes') === false) {
        return [];
    }

    var usableEmotes = [],
        emotes = store.gwEmotes;

    Object.keys(emotes).forEach(function(key) {
        var emote = emotes[key];

        // console.log('emote', emote);

        if (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') !== true) {
            return;
        }

        usableEmotes.push({
            text: emote.code,
            channel: 'GameWisp Emotes',
            badge: 'http://bdcraft.net/community/images/smilies/aaw.png',
            url: emote.url
        });
    });

    return usableEmotes;
};
