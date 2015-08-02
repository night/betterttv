module.exports = function() {
    if ($('.archive_info').length) return;

    var template = '<iframe id="twitchcast" src="https://nightdev.com/twitchcast/?ontwitch={{hostname}}&channel={{channel}}" width="100%" height="100%" style="position: absolute;top: 0px;left: 0px;border: none;"></iframe>';

    var openTwitchCast = function() {
        // For some reason Twitch's built-in Twitch.player.ready *doesn't work* with their new player.
        if ($('#player object').length) {
            try {
                $('#player object')[0].pauseVideo();
            } catch(e) {
                // Twitch's player doesn't support pauseVideo anymore.
            }
        }

        $('#player').append(template.replace('{{hostname}}', encodeURIComponent(window.location.protocol + '//' + window.location.host)).replace('{{channel}}', bttv.getChannel()));

        var close = function() {
            $('#twitchcast').remove();
            window.removeEventListener('message', close, false);
        };
        window.addEventListener('message', close, false);
    };

    var placeButton = function() {
        if ($('#twitchcast_button').length) return;

        var $button = $('<div/>');
        $button.attr('id', 'twitchcast_button');
        $button.click(openTwitchCast);
        $('#player').append($button);
    };

    var castAvailable = function(callback) {
        if (!window.chrome) return callback(true);

        if (window.chrome.cast && window.chrome.cast.isAvailable) {
            return callback(false);
        }

        setTimeout(function() {
            castAvailable(callback);
        }, 1000);
    };

    if (bttv.settings.get('twitchCast')) {
        if (!$('#chromecast_sender').length) {
            var $senderjs = $('<script/>');
            $senderjs.attr('id', 'chromecast_sender');
            $senderjs.attr('src', 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js');
            $('head').append($senderjs);
        }
        castAvailable(function(error) {
            if (!error) placeButton();
        });
    } else {
        $('#chromecast_sender').remove();
        $('#twitchcast_button').remove();
    }
};
