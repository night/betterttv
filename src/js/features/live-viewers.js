var debug = require('../helpers/debug');

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

module.exports = function() {
    if (bttv.settings.get('showViewersInPlayer') === true) {
        sleep(1000);
        $('.live-count').unbind('DOMSubtreeModified');
        debug.log('Replacing "LIVE" with viewer count');
        $('span.js-live-label').text(function() {
            return $('.live-count').text() + 'Viewers';
        });
        $('.live-count').bind('DOMSubtreeModified', function() {
            $('span.js-live-label').text(function() {
                return $('.live-count').text() + 'Viewers';
            });
        });
    }

    if (bttv.settings.get('showViewersInPlayer') === false) {
        debug.log('Restoring "LIVE" in the player');
        $('.live-count').unbind('DOMSubtreeModified');
        $('span.js-live-label').text(function() {
            return 'Live';
        });
    }
};
