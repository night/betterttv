var debug = require('../debug');

module.exports = function () {
    if(bttv.settings.get("clickTwitchEmotes") === true) {
        debug.log("Injecting Twitch Chat Emotes Script");

        var emotesJSInject = document.createElement("script");
        emotesJSInject.setAttribute("src", "//cdn.betterttv.net/js/twitchemotes.js?"+bttv.info.versionString());
        emotesJSInject.setAttribute("type", "text/javascript");
        emotesJSInject.setAttribute("id", "clickTwitchEmotes");
        $("body").append(emotesJSInject);

        var counter = 0;
        var getterInterval = setInterval(function() {
            counter++;

            if(counter > 29) {
                clearInterval(getterInterval);
                return;
            }

            if(window.emoteMenu) {
                window.emoteMenu.registerEmoteGetter('BetterTTV', bttv.chat.emotes);
                clearInterval(getterInterval);
            }
        }, 1000);
    }
}