var debug = require('../../helpers/debug'),
    vars = require('../../vars');

var playerContainers = [
    '.dynamic-player',
    '.dynamic-target-player',
];

var players = [
    '.dynamic-player object',
    '.dynamic-player video',
    '.dynamic-player iframe',
    '.dynamic-target-player object',
    '.dynamic-target-player video',
    '.dynamic-target-player iframe'
];

var generateCSS = function(height) {
    return playerContainers.join(', ') + ', ' + players.join(', ') + ' { width: 100% !important; height: ' + height + 'px !important; }';
};

var getPlayerHeight = function() {
    var isNewPlayer = typeof $('#player .dynamic-player .player').data('playertype') !== 'undefined';

    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        if (!$(player).length) continue;

        return ($(player).width() * 0.5625) + (player.indexOf('iframe') > -1 || isNewPlayer ? 0 : 30);
    }

    return -1;
};

module.exports = function() {
    if ($('#main_col #channel').length === 0 || $('#right_col').length === 0) return;

    debug.log('Page resized');

    var hostModeEnabled = $('#hostmode').length;

    var $playerStyle = $('#bttvPlayerStyle');

    if (!$playerStyle.length) {
        $playerStyle = $('<style></style>');
        $playerStyle.attr('id', 'bttvPlayerStyle');
        $('body').append($playerStyle);
    }

    // If chat sidebar is closed, element width != 0
    if (vars.chatWidth === 0) {
        $('#main_col').css({
            marginRight: '0px'
        });
    } else {
        $('#main_col').css({
            marginRight: $('#right_col').width() + 'px'
        });
    }

    var fullPageHeight = $(window).height();
    var fullPlayerHeight = getPlayerHeight();
    if (fullPlayerHeight === -1) return;
    var metaAndStatsHeight;

    var meta,
        stats;
    if (hostModeEnabled) {
        var title = $('.hostmode-title-container').outerHeight(true);
        meta = $('.target-meta').outerHeight(true);
        stats = $('#hostmode .channel-actions').outerHeight(true);
        var close = $('.close-hostmode').outerHeight(true);
        metaAndStatsHeight = title + meta + stats + close + 33;

        // Fixes host frame height on resize (the close button repositions)
        $('.target-frame').css('height', $(window).height());
    } else {
        meta = $('#broadcast-meta').outerHeight(true);
        stats = $('.stats-and-actions').outerHeight();
        metaAndStatsHeight = meta + stats;
    }

    var desiredPageHeight = metaAndStatsHeight + fullPlayerHeight;

    // If the window height is larger than the height needed to display
    // the title (meta) and stats below video, the video player can be its'
    // 16:9 normal height
    if ($(window).height() > desiredPageHeight) {
        $playerStyle.html(generateCSS(fullPlayerHeight));
    } else {
        // Otherwise we need to create black bars on the video
        // to accomodate room for title (meta) and stats
        $playerStyle.html(generateCSS(fullPageHeight - metaAndStatsHeight));
    }

    // Channel panels below the stream auto arrange based on width
    if (!hostModeEnabled) {
        $('#channel_panels').masonry('reload');
    }
};
