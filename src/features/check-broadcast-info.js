var debug = require('debug');

var checkBroadcastInfo = module.exports = function() {
    var channel = bttv.getChannel();

    if(!channel) return setTimeout(checkBroadcastInfo, 60000);

    debug.log("Check Channel Title/Game");

    Twitch.api.get("channels/"+channel).done(function(d) {
        if(d.game) {
        	if($('#broadcast-meta .channel .playing').length) {
        		$('#broadcast-meta .channel a:eq(1)').text(d.game).attr("href",Twitch.uri.game(d.game));
        	}
        }
        if(d.status) {
        	$('#broadcast-meta .title .real').text(d.status);
        	$('#broadcast-meta .title .over').text(d.status);
        }
        setTimeout(checkBroadcastInfo, 60000);
    });
}