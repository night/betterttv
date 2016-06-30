module.exports = function(flag) {
    if (flag === true) {
        $('div.player-livestatus__online').text(function() {
            return $('.live-count').text() + 'Viewers';
        });

        $('.live-count').bind('DOMSubtreeModified', function() {
            $('div.player-livestatus__online').text(function() {
                return $('.live-count').text() + 'Viewers';
            });
        });
    }
    if (flag === false) {
        $('.live-count').unbind();
        $('div.player-livestatus__online').text(function() {
            return 'LIVE';
        });
    }
};
