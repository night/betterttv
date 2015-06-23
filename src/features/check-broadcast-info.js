var debug = require('../helpers/debug');

var checkBroadcastInfo = module.exports = function() {
    var channel = bttv.getChannel();

    if(!channel) return setTimeout(checkBroadcastInfo, 60000);

    debug.log("Check Channel Title/Game");

    bttv.TwitchAPI.get("channels/"+channel).done(function(d) {
        if(d.game) {
            var $channel = $('#broadcast-meta .channel');
            
            if($channel.find('.playing').length) {
                $channel.find('a:eq(1)').text(d.game).attr("href", Twitch.uri.game(d.game)).removeAttr('data-ember-action');
            }
        }
        if(d.status) {
            var $title = $('#broadcast-meta .title');

            if($title.data('status') !== d.status) {
                document.title = d.display_name + " - Twitch | " + d.status;
                $title.data('status', d.status);

                d.status = d.status.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                d.status = bttv.chat.templates.linkify(d.status);

                $title.find('.real').html(d.status);
                $title.find('.over').html(d.status);
            }
        }

        setTimeout(checkBroadcastInfo, 60000);
    });
}