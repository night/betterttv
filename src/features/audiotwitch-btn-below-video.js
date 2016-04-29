var vars = require('../vars.js');

module.exports = function() {
    if (bttv.settings.get('audiotwitchButton') !== true) return;

    var $btn = $('#bttv-audiotwitch-button');
    if (!$btn.length) {
        $btn = $('<span><span></span></span>');
        $btn.addClass('button').addClass('action');
        $btn.attr('id', 'bttv-audiotwitch-button');
        $btn.insertBefore('#channel .channel-actions .js-options');
        $btn.children('span').text('RadioTwitch');
        $btn.click(function() {
            if (vars.liveChannels.indexOf(bttv.getChannel()) >= 0) {
                window.open('http://' + bttv.getChannel() + '.radiotwitch.in/');
            } else {
                bttv.notify('Channel is offline.', {});
            }
        });
    }
};
