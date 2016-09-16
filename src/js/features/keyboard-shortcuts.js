var debug = require('../helpers/debug');

module.exports = function() {
    debug.log('keyboard-shortcuts.js is firing!');
    document.onkeydown = function(e) {
        debug.log('we pressed something!', e);
        switch (e.keyCode) {
            case 75:
                document.getElementById('video-1').Mousetrap.trigger('space');
                debug.log('triggering space');
                break;
        }
    };
    /*
    function handleKeyEvent(keyPressed) {
        if (keyPressed.keyCode === '75') {
            debug.log('you pressed: ', keyPressed);
            try {
                window.Mousetrap.trigger('space');
            } catch (keyEvent) {
                debug.log('Error toggling play/pause through Mousetrap: ', keyEvent);
            }
        }
    }
    */
    window.addEventListener('keydown', handleKeyEvent, false);
    debug.log('eventlistener added I guess?');
};
