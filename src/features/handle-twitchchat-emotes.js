var debug = require('../helpers/debug');

module.exports = function() {
    // Inject the emote menu if option is enabled.
    if (bttv.settings.get('clickTwitchEmotes') === true) {
        debug.log('Injecting Twitch Chat Emotes Script');

        var emotesJSInject = document.createElement('script');
        emotesJSInject.setAttribute('src', 'https://cdn.betterttv.net/js/twitchemotes.js?' + bttv.info.versionString());
        emotesJSInject.setAttribute('type', 'text/javascript');
        emotesJSInject.setAttribute('id', 'clickTwitchEmotes');
        $('body').append(emotesJSInject);
    }

    // Try hooking into the emote menu, regardless of whether we injected or not.
    var counter = 0;
    var getterInterval = setInterval(function() {
        counter++;

        if (counter > 29) {
            clearInterval(getterInterval);
            return;
        }

        if (window.emoteMenu) {
            clearInterval(getterInterval);
            debug.log('Hooking into Twitch Chat Emotes Script');
            window.emoteMenu.registerEmoteGetter('BetterTTV', bttv.chat.emotes);
        }
    }, 1000);
};
