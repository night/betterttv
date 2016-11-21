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
                    var playerEmberId = $player.closest('.ember-view').attr('id');
                    var emberView = App.__container__.lookup('-view-registry:main')[playerEmberId];
                    if (!emberView) return;
                    var player = emberView.player;
                    if (!player) return;

                    if (!isPaused) player.pause();
                }
                clicks = 0;
            }, 250);
        }
    });

    $('body').on('click', '.player-controls-bottom .js-control-fullscreen', function() {
        var $player = $('#player');

        setTimeout(function() {
            $('.js-main-col-scroll-content').scrollTop(0);
        }, 100);

        var isTheater = $player.attr('data-theatre');
        if (isTheater !== 'true') return;

        var playerEmberId = $player.closest('.ember-view').attr('id');
        var emberView = App.__container__.lookup('-view-registry:main')[playerEmberId];
        if (!emberView) return;
        var player = emberView.player;
        if (!player) return;

        player.theatre = false;
    });
};
