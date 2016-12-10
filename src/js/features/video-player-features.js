module.exports = function() {
    // Click to play/pause video
    var clicks = 0;
    $('body').on('click', '.player-overlay.player-fullscreen-overlay', function() {
        if (bttv.settings.get('clickToPlay') === true) {
            clicks++;
            setTimeout(function() {
                if (clicks === 1) {
                    var $player = $('#player');
                    var isPaused = $player.data('paused');
                    var playerService = App.__container__.lookup('service:player');
                    if (!playerService || !playerService.playerComponent.player) return;
                    if (!isPaused) playerService.playerComponent.player.pause();
                }
                clicks = 0;
            }, 250);
        }
    });

    $('body').on('click', '.player-controls-bottom .js-control-fullscreen', function() {
        var $player = $('#player');

        setTimeout(function() {
            var height = bttv.settings.get('disableChannelHeader') ? 0 : 380;
            $('.js-main-col-scroll-content').scrollTop(height);
        }, 100);

        var isTheater = $player.attr('data-theatre');
        if (isTheater !== 'true') return;

        var playerService = App.__container__.lookup('service:player');
        if (!playerService || !playerService.playerComponent.player) return;
        playerService.playerComponent.player.theatre = false;
    });
};
