var tmi = require('./tmi'),
    store = require('./store'),
    helpers = require('./helpers');

var vars = bttv.vars;

module.exports = function() {
    if (bttv.settings.get('bttvEmotes') === false) {
        return [];
    }
    var proEmotes = store.proEmotes[vars.userData.name];
    var emotes = $.extend({}, store.bttvEmotes, proEmotes);
    var usableEmotes = [];
    var emoteSets;

    if (vars.userData.isLoggedIn && bttv.chat.helpers.getEmotes(vars.userData.name)) {
        emoteSets = helpers.getEmotes(vars.userData.name);
    }

    Object.keys(emotes).forEach(function(key) {
        var emote = emotes[key];

        if (emote.restrictions) {
            if (emote.restrictions.channels.length && emote.restrictions.channels.indexOf(bttv.getChannel()) === -1) return;
            if (emote.restrictions.games.length && tmi().channel && emote.restrictions.games.indexOf(tmi().channel.game) === -1) return;

            if (emote.restrictions.emoticonSet && emoteSets.indexOf(emote.restrictions.emoticonSet) === -1) return;
        }

        if (emote.imageType === 'gif' && bttv.settings.get('bttvGIFEmotes') !== true) {
            return;
        }

        usableEmotes.push({
            text: emote.code,
            channel: 'BetterTTV ' + emote.type.capitalize() + ' Emotes',
            badge: 'https://cdn.betterttv.net/tags/developer.png',
            url: emote.url
        });
    });

    // console.log('usable bttv emotes', usableEmotes);
    return usableEmotes;
};
