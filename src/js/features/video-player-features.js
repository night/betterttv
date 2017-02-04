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
                    var playerService = App.__container__.lookup('service:persistent-player');
                    if (!playerService || !playerService.playerComponent.player) return;
                    if (!isPaused) playerService.playerComponent.player.pause();
                }
                clicks = 0;
            }, 250);
        }
    });
};
