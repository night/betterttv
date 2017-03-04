var keyCodes = require('../keycodes');

module.exports = function() {
    function handleKeyEvent(keyup) {
        if (keyup.ctrlKey || keyup.metaKey || keyup.shiftKey) return;
        if (!$('input, textarea, select').is(':focus')) {
            if (keyup.keyCode === keyCodes.k) {
                $('#player').find('.js-control-playpause-button').click();
            } else if (keyup.keyCode === keyCodes.f) {
                $('#player').find('.js-control-fullscreen').click();
            } else if (keyup.keyCode === keyCodes.m) {
                $('#player').find('.js-control-volume').click();
            }
        }
    }

    if (bttv.settings.get('playerKeyboardShortcuts') === true) {
        $(document).on('keyup.playerControls', handleKeyEvent);
    } else if (bttv.settings.get('playerKeyboardShortcuts') === false) {
        $(document).off('keyup.playerControls');
    }
};
