var debug = require('../helpers/debug');

function checkBind() {
    var isBound = false;
    if ($('.live-count').length) {
        $.each($('.live-count').data('events'), function(i) {
            if (i === 'DOMSubtreeModified') {
                isBound = true;
                return;
            }
        });
    }
    return isBound;
}


module.exports = function() {
    if (bttv.settings.get('showViewersInPlayer') === true) {
        if (checkBind() === true) {
            $('.live-count').unbind('DOMSubtreeModified');
        }
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
        if (checkBind() === true) {
            $('.live-count').unbind('DOMSubtreeModified');
        }
        $('span.js-live-label').text(function() {
            return 'Live';
        });
    }
};
