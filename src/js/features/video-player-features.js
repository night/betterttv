module.exports = function() {
    // Click to play/pause video
    $('body').on('click', '.player-overlay', function() {
        $('.js-control-playpause-button').click();
    });
};
