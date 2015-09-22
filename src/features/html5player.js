module.exports = function() {
    if (!bttv.settings.get('forceHTML5Player')) return;

    if (typeof $('#player .player').data('playertype') !== 'undefined') return;

    var player = $('#player.dynamic-player object, #player.dynamic-player video');
    if (!player.length) return;

    var container = $('<div/>');
    container.attr('id', 'video-1');
    container.attr('class', 'player');

    $('#player div').replaceWith(container);

    var video = undefined;
    if (/^\/[a-zA-Z0-9_]+\/(v|c)\/[0-9]+/.test(window.location.pathname)) {
        var path = window.location.pathname.split('/');
        video = path[2] + path[3];
    }

    var playerOptions = $.param({
        channel: video ? undefined : bttv.getChannel(),
        video: video,
        branding: 'false',
        player: 'site',
        channelInfo: 'false',
        controls: 'true',
        height: '100%',
        width: '100%'
    });

    player = new Twitch.video.Player('video-1', playerOptions);
};
