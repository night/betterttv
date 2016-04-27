module.exports = function() {
    if (bttv.settings.get('audiotwitchButton') !== true) return;

    var $btn = $('#bttv-audiotwitch-button');
    if (!$btn.length) {
        $btn = $('<span><span></span></span>');
        $btn.addClass('button').addClass('action');
        $btn.attr('id', 'bttv-audiotwitch-button');
        $btn.insertBefore('#channel .channel-actions .js-options');
        $btn.children('span').text('Audiotwitch');
        $btn.click(function() {
            window.open('http://audiotwitch.tv/' + bttv.getChannel());
        });
    }
};
