var keyCodes = require('../keycodes');

module.exports = function() {
    function handleKeyEvent(keyup) {
        if (!$('input, textarea, select').is(':focus')) {
            if (keyup.keyCode === keyCodes.k) {
                document.getElementsByClassName('js-control-playpause-button')[0].click();
            } else if (keyup.keyCode === keyCodes.f) {
                document.getElementsByClassName('js-control-fullscreen')[0].click();
            } else if (keyup.keyCode === keyCodes.m) {
                document.getElementsByClassName('js-control-volume')[0].click();
            }
        }
    }

    if (bttv.settings.get('playerKeyboardShortcuts') === true) {
        $(document).on('keyup.playerControls', handleKeyEvent);
    } else if (bttv.settings.get('playerKeyboardShortcuts') === false) {
        $(document).off('keyup.playerControls');
    }
};
