var tmi = require('./tmi'),
    store = require('./store'),
    helpers = require('./helpers');

module.exports = function() {
    if(bttv.settings.get("bttvEmotes") === false) {
        return [];
    }
    var emotes = store.bttvEmotes;
    var usableEmotes = [];

    if(vars.userData.isLoggedIn && bttv.chat.helpers.getEmotes(vars.userData.login)) {
        var emoteSets = bttv.chat.helpers.getEmotes(vars.userData.login);
    }

    Object.keys(emotes).forEach(function(key) {
        var emote = emotes[key];

        if(emote.restriction) {
            if(emote.restriction.channels && emote.restriction.channels.indexOf(bttv.getChannel()) === -1) return;
            if(emote.restriction.games && emote.restriction.games.indexOf(tmi().channel.game) === -1) return;
        }

        if(emote.emoticon_set && emoteSets.indexOf(emote.emoticon_set) === -1) return;

        emote.text = emote.regex;

        if(!emote.channel) {
            emote.channel = "BetterTTV Emotes"
            emote.badge = "https://cdn.betterttv.net/tags/developer.png"
        }

        usableEmotes.push(emote);
    });

    return usableEmotes;
};