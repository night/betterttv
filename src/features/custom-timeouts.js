var template = require('../templates/custom-timeouts');

module.exports = function(user, $event) {
    // if (!chatHelpers.isModerator(user)) {
    //     return;
    // }

    $('.ember-chat .chat-room').append(template({ displayName: $event.text() }));

    $('body').on('mouseup.custom-timeouts', function() {
        $('#bttv-custom-timeout-contain').remove();
        $('body').off('.custom-timeouts');
        $('.chat-line[data-sender="' + user + '"]').removeClass('bttv-user-locate');
    });

    $('#bttv-custom-timeout-contain').css({
        'top': $event.offset().top + ($event.height() / 2) - ($('#bttv-custom-timeout-contain').height() / 2),
        'left': $('.ember-chat .chat-room').offset().left - $('#bttv-custom-timeout-contain').width() + $('.ember-chat .chat-room').width()
    });

    $('body').on('mousemove.custom-timeouts', function() {
        // $('#bttv-custom-timeout-contain').css({'top': e.pageY, 'left': e.pageX});
    });

    $('.chat-line[data-sender="' + user + '"]').addClass('bttv-user-locate');
};
