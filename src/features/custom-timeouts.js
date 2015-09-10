var template = require('../templates/custom-timeouts');
var vars = require('../vars');
var helpers = require('../chat/helpers');

module.exports = function(user, $event) {
    if (!helpers.isModerator(vars.userData.login)) {
        return;
    }

    $('#bttv-custom-timeout-contain').remove();
    $('.ember-chat .chat-room').append(template());

    $('#bttv-custom-timeout-contain').css({
        'top': $event.offset().top + ($event.height() / 2) - ($('#bttv-custom-timeout-contain').height() / 2),
        'left': $('.ember-chat .chat-room').offset().left - $('#bttv-custom-timeout-contain').width() + $('.ember-chat .chat-room').width() - 20
    });

    var action = {type: 'cancel', length: 0, text: 'CANCEL'};

    $('body').on('mousemove.custom-timeouts', function(e) {
        var offset = e.pageY - $('#bttv-custom-timeout-contain').offset().top;
        var offsetx = e.pageX - $('#bttv-custom-timeout-contain').offset().left;
        var amount = 200 - offset;
        var time = Math.floor(Math.pow(1.5, (amount - 20) / 7) * 60);

        var humanTime = Math.floor(time / 60) + ' Minutes';
        if (Math.floor(time / 60 / 60) > 0) humanTime = Math.floor(time / 60 / 60) + ' Hours';
        if (Math.floor(time / 60 / 60 / 24) > 0) humanTime = Math.floor(time / 60 / 60 / 24) + ' Days';

        if (amount > 0 && amount <= 20) action = {type: 'time', length: 2, text: 'PURGE'};
        if (amount >= 180 && amount < 200) action = {type: 'ban', length: 0, text: 'BAN'};
        if (amount > 20 && amount < 180) action = {type: 'time', length: time, text: humanTime};
        if (amount > 200 || amount < 0 || offsetx > 80 || offsetx < 0) action = {type: 'cancel', length: 0, text: 'CANCEL'};

        $('#bttv-custom-timeout-contain .text').text(action.text);
        $('#bttv-custom-timeout-contain .cursor').css('top', offset);
    });

    $('body').on('mousedown.custom-timeouts', function() {
        if (action.type === 'ban') helpers.ban(user);
        if (action.type === 'time') helpers.timeout(user, action.length);

        $('#bttv-custom-timeout-contain').remove();
        $('body').off('.custom-timeouts');
        $('.chat-line[data-sender="' + user + '"]').removeClass('bttv-user-locate');
    });

    $('.chat-line[data-sender="' + user + '"]').addClass('bttv-user-locate');
};
