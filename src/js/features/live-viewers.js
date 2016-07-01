var debug = require('../helpers/debug');

function checkBind() {
    $.each($('.live-count').data('events'), function(i) {
        if (i === 'DOMSubtreeModified') {
            return true;
        }
    });
    return false;
}


module.exports = function() {
    if (bttv.settings.get('showViewersInPlayer') === true) {
        if (checkBind === true) {
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
        if (checkBind === true) {
            $('.live-count').unbind('DOMSubtreeModified');
        }
        $('span.js-live-label').text(function() {
            return 'Live';
        });
    }
};
