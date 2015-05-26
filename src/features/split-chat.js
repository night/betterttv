var debug = require('../helpers/debug');

module.exports = function () {
    if (bttv.settings.get("splitChat") !== false) {
        debug.log("Splitting Chat");

        var splitCSS = document.createElement("link");
        bttv.settings.get("darkenedMode") === true ? splitCSS.setAttribute("href", "https://cdn.betterttv.net/style/stylesheets/betterttv-split-chat-dark.css") : splitCSS.setAttribute("href", "https://cdn.betterttv.net/style/stylesheets/betterttv-split-chat.css");
        splitCSS.setAttribute("type", "text/css");
        splitCSS.setAttribute("rel", "stylesheet");
        splitCSS.setAttribute("id", "splitChat");
        $('body').append(splitCSS);
    }
}