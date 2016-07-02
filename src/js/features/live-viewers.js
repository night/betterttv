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
    var $div = $('div.app-main');
    var viewerSpan = '<span id="viewerSpan">"Loading Viewers...</span>';
    $('div.player-livestatus').append(viewerSpan);
    $('#viewerSpan').text(function() {
        return $('.live-count').text() + 'Viewers';
    });

    if (checkBind() === true) {
        $('.live-count').unbind('DOMSubtreeModified');
    }

    debug.log('Creating viewer count span');
    $('.live-count').bind('DOMSubtreeModified', function() {
        $('#viewerSpan').text(function() {
            return $('.live-count').text() + 'Viewers';
        });
    });

    if ($div.hasClass('theatre')) {
        $('#viewerSpan').show();
    } else {
        $('#viewerSpan').hide();
    }

    function enableCount() {
        debug.log('Showing viewer count under "LIVE"');
        $('#viewerSpan').show();
    }

    function disableCount() {
        debug.log('Hiding viewer count');
        $('#viewerSpan').hide();
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                var attributeValue = $(mutation.target).prop(mutation.attributeName);
                if (attributeValue.includes('theatre')) {
                    enableCount();
                } else {
                    disableCount();
                }
            }
        });
    });
    observer.observe($div[0], {
        attributes: true
    });
};
