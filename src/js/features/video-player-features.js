module.exports = function() {
    // Click to play/pause video
    var clicks = 0;
    $('body').on('click', '.player-overlay', function() {
        clicks++;
        setTimeout(function() {
            if (clicks === 1) $('.js-control-playpause-button').click();
            clicks = 0;
        }, 250);
    });
};
