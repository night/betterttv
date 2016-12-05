// adds simple shortcuts to the Twitch player
module.exports = function() {
    // used for stopping the user from holding the key down
    var keyStopper = false;

    function handleKeyEvent(keyPressed) {
        // check that we aren't focused on any inputs etc and we aren't smashing the key
        if (!$('input, textarea').is(':focus') && !keyStopper) {
            keyStopper = true;
            // works as long as the classnames don't get changed or their order mixed...
            if (keyPressed.keyCode === 70) {
                document.getElementsByClassName('js-control-fullscreen')[0].click();
            } else if (keyPressed.keyCode === 75) {
                document.getElementsByClassName('js-control-playpause-button')[0].click();
            } else if (keyPressed.keyCode === 77) {
                document.getElementsByClassName('js-control-volume')[0].click();
            }
        }
        // releases the keystopper on keyup, so we can start pressing again.
        $(document).one('keyup.keyStopper', function() {
            keyStopper = false;
        });
    }
    // act according to the settings
    if (bttv.settings.get('playerKeyboardShortcuts') === true) {
        // create custom event namespace, so that we can later remove it easily
        $(document).on('keydown.playerControls', handleKeyEvent);
    } else if (bttv.settings.get('playerKeyboardShortcuts') === false) {
        $(document).off('keydown.playerControls');
    }
};
