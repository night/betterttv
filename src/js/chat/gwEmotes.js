// var tmi = require('./tmi'),
//     store = require('./store'),
//     helpers = require('./helpers');

var store = require('./store');

module.exports = function() {
    if (bttv.settings.get('gwEmotes') === false) {
        return [];
    }

    var usableEmotes = [];

    /* TODO: might want to split global and subcriber emotes into separate stores? think about this before commiting to it.
             they will be displayed in the same section in the emote panel. */
    // var emotes = $.extend({}, store.gwGlobalEmotes, gwSubEmotes);
    var emotes = store.gwEmotes;

    Object.keys(emotes).forEach(function(key) {
        var emote = emotes[key];

        // if (emote.restrictions) {
        //     if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return;
        //     if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return;

        //     if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return;
        // }

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

    console.log('usable gw emotes', usableEmotes);
    return usableEmotes;
};
