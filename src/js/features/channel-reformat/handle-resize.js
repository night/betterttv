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

var previousHeight = 0;

var generateCSS = function(height) {
    previousHeight = height;
    return playerContainers.join(', ') + ', ' + players.join(', ') + ' { width: 100% !important; height: ' + height + 'px !important; }';
};

var generateFixedRightOffsets = function(right) {
    return '.cn-bar-fixed, .app-main.theatre .cn-content #player { right: ' + right + 'px !important; }';
};

var getPlayerHeight = function() {
    var isNewPlayer = typeof $('#player .player').data('playertype') !== 'undefined';

    for (var i = 0; i < players.length; i++) {
        var player = players[i];

        if (!$(player).length) continue;

        return ($(player).width() * 0.5625) + (player.indexOf('iframe') > -1 || isNewPlayer ? 0 : 30);
    }

    return -1;
};

module.exports = function() {
    if ($('#right_col').length === 0) return;

    debug.log('Page resized');

    var $playerStyle = $('#bttvPlayerStyle');

    if (!$playerStyle.length) {
        $playerStyle = $('<style></style>');
        $playerStyle.attr('id', 'bttvPlayerStyle');
        $('body').append($playerStyle);
    }

    var rightMargin = 0;

    // If chat sidebar is closed, element width != 0
    if (vars.chatWidth === 0 || $('#right_col').hasClass('closed')) {
        $('#main_col').css({
            marginRight: '0px'
        });
    } else {
        rightMargin = $('#right_col').width();
        $('#main_col').css({
            marginRight: rightMargin + 'px'
        });
    }

    if ($('#main_col #channel').length === 0) return;

    var fullPageHeight = $(window).height();
    var fullPlayerHeight = getPlayerHeight();
    if (fullPlayerHeight === -1) {
        $playerStyle.html(generateCSS(previousHeight) + generateFixedRightOffsets(rightMargin));
        return;
    }

    var meta = $('.cn-bar').outerHeight(true);
    var stats = $('.cn-metabar').outerHeight(true) + 20;
    var recentPastBroadcastHeight = $('.recent-past-broadcast').length ? $('.recent-past-broadcast').outerHeight(true) : 0;
    var hostModeHeight = $('.cn-hosting').length ? $('.cn-hosting--top').outerHeight(true) + $('.cn-hosting--bottom').outerHeight(true) + 20 : 0;
    var metaAndStatsHeight = meta + stats + recentPastBroadcastHeight + hostModeHeight;
    var desiredPageHeight = metaAndStatsHeight + fullPlayerHeight;

    // If the window height is larger than the height needed to display
    // the title (meta) and stats below video, the video player can be its'
    // 16:9 normal height
    if ($(window).height() > desiredPageHeight) {
        $playerStyle.html(generateCSS(fullPlayerHeight) + generateFixedRightOffsets(rightMargin));
    } else {
        // Otherwise we need to create black bars on the video
        // to accomodate room for title (meta) and stats
        $playerStyle.html(generateCSS(fullPageHeight - metaAndStatsHeight) + generateFixedRightOffsets(rightMargin));
    }
};
