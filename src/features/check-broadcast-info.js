var debug = require('debug');

var checkBroadcastInfo = module.exports = function () {
    var channel = bttv.getChannel();

    if(!channel) return;

    debug.log("Check Channel Title/Game");

    Twitch.api.get("channels/"+channel).done(function (d) {
        if (d.game && d.status) {
            $("#channel #broadcast-meta .js-game").text(d.game).attr("href",Twitch.uri.game(d.game));
        }
        setTimeout(checkBroadcastInfo, 60000);
    });
}