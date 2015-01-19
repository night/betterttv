var debug = require('../debug');

module.exports = function () {
    if(bttv.settings.get("clickTwitchEmotes") === true) {
        debug.log("Injecting Twitch Chat Emotes Script");

        var emotesJSInject = document.createElement("script");
        emotesJSInject.setAttribute("src", "//cdn.betterttv.net/js/twitchemotes.js?"+bttv.info.versionString());
        emotesJSInject.setAttribute("type", "text/javascript");
        emotesJSInject.setAttribute("id", "clickTwitchEmotes");
        $("body").append(emotesJSInject);

        if(window.emoteMenu) {
        	window.emoteMenu.registerEmoteGetter('BetterTTV', bttv.chat.emotes);
        }
    }
}