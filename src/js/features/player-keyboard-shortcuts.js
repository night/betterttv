var keyCodes = require('../keycodes');
// adds simple shortcuts to the Twitch player
module.exports = function() {
    // used for stopping the user from holding the key down
    var keyStopper = false;

    function handleKeyEvent(keyPressed) {
        try {
            var player = App.__container__.lookup('service:player').playerComponent.player;

            // check that we aren't focused on any inputs and we've released the key since last press
            if (!$('input, textarea, select').is(':focus') && !keyStopper) {
                keyStopper = true;

                if (keyPressed.keyCode === keyCodes.k) {
                    // 'k', toggle play/pause
                    if (player.paused) {
                        player.play();
                    } else {
                        player.pause();
                    }
                } else if (keyPressed.keyCode === keyCodes.f) {
                    // 'f', toggle fullscreen
                    player.fullscreen = !player.fullscreen;
                } else if (keyPressed.keyCode === keyCodes.m) {
                    // 'm', toggle mute
                    player.muted = !player.muted;
                }
            }
        } catch (err) {
            // catch the typeError if the playerComponent.player doesn't exist and then just silently fail
            return;
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
