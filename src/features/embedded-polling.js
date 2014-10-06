var debug = require('../debug');

var frameTimeout = null;

module.exports = function (pollID) {
    if (!bttv.settings.get('embeddedPolling')) return;
    
    if ($('#bttv-poll-contain').length && $('#bttv-poll-contain .bttv-poll-frame').is(':visible')) return;

    if ($('#bttv-poll-contain').length) {
        $('#bttv-poll-contain').remove();
    }

    var frameTemplate = '<div id="bttv-poll-contain">';
    frameTemplate += '<div class="bttv-poll-title">New poll available! <span style="text-decoration: underline;">Vote now!</span></div>';
    frameTemplate += '<div class="bttv-poll-close"><svg height="16px" version="1.1" viewBox="0 0 16 16" width="16px" x="0px" y="0px" class="svg-close"><path clip-rule="evenodd" d="M13.657,3.757L9.414,8l4.243,4.242l-1.415,1.415L8,9.414l-4.243,4.243l-1.414-1.415L6.586,8L2.343,3.757l1.414-1.414L8,6.586l4.242-4.243L13.657,3.757z" fill-rule="evenodd"></path></svg></div>'
    frameTemplate += '<iframe class="bttv-poll-frame" src="http://strawpoll.me/embed_2/'+pollID+'"></iframe>';
    frameTemplate += '</div>';

    $('.ember-chat .chat-room').append(frameTemplate);

    if (frameTimeout !== null) {
        clearTimeout(frameTimeout);
        frameTimeout = null;
    }
    
    frameTimeout = setTimeout(function() {
        $('#bttv-poll-contain').remove();
    }, 60 * 1000);

    $('#bttv-poll-contain .bttv-poll-close').on('click', function() {
        $('#bttv-poll-contain').remove();

        if (frameTimeout !== null) {
            clearTimeout(frameTimeout);
            frameTimeout = null;
        }
    });

    $('#bttv-poll-contain .bttv-poll-title').on('click', function() {
        $('#bttv-poll-contain .bttv-poll-frame').show();
        $('#bttv-poll-contain .bttv-poll-title').text('Thanks!');
        $('#bttv-poll-contain').css('height', '450px');

        if (frameTimeout !== null) {
            clearTimeout(frameTimeout);
            frameTimeout = null;
        }
    });

    $("#bttv-poll-contain").slideDown(200);
}
