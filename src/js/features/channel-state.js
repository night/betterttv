var vars = require('../vars');
var template = require('../../templates/channel-state');

var stateContainer = '#bttv-channel-state-contain';
var chatHeader = '.chat-container .chat-header:first';
var chatButton = '.chat-interface .chat-buttons-container .button.primary.float-right';

var displaySeconds = function(s) {
    var date = new Date(0);
    date.setSeconds(s);
    date = date.toISOString().substr(11, 8);
    date = date.split(':');

    while (date[0] === '00') {
        date.shift();
    }

    if (date.length === 1 && date[0].charAt(0) === '0') {
        date[0] = parseInt(date[0], 10);
    }

    return date.join(':');
};

var resetCountDown = function() {
    if (bttv.chat.store.chatCountDown) clearInterval(bttv.chat.store.chatCountDown);
    bttv.chat.store.chatCountDown = false;
    $(chatButton).find('span').text('Chat');
};

var initiateCountDown = function(length) {
    if (bttv.chat.store.chatCountDown) clearInterval(bttv.chat.store.chatCountDown);

    var endTimestamp = Date.now() + (length * 1000);

    bttv.chat.store.chatCountDown = setInterval(function() {
        var remainingTime = endTimestamp - Date.now();

        if (remainingTime <= 0) {
            return resetCountDown();
        }

        $(chatButton).find('span').text('Chat in ' + displaySeconds(Math.ceil(remainingTime / 1000)));
    }, 500);
};

module.exports = function(event) {
    var $stateContainer = $(stateContainer);
    if (!$stateContainer.length) {
        $(chatHeader).append(template());
        $stateContainer = $(stateContainer);
        $stateContainer.children().each(function() {
            $(this).hide();

            if ($(this).hasClass('slow')) {
                $(this).find('.slow-time').tipsy({
                    gravity: $.fn.tipsy.autoNS
                });
                $(this).find('svg').tipsy({
                    gravity: $.fn.tipsy.autoNS
                });
            } else {
                $(this).tipsy({
                    gravity: $.fn.tipsy.autoNS
                });
            }
        });
    }

    switch (event.type) {
        case 'roomstate':
            var enabled;
            if ('slow' in event.tags) {
                var length = event.tags.slow;

                bttv.chat.store.slowTime = length;

                $stateContainer
                    .find('.slow-time')
                    .attr('original-title', length + ' seconds')
                    .text(displaySeconds(length));

                if (length === 0) {
                    $stateContainer.find('.slow').hide();
                    $stateContainer.find('.slow-time').hide();
                } else {
                    $stateContainer.find('.slow').show();
                    $stateContainer.find('.slow-time').show();
                }
            }

            if ('r9k' in event.tags) {
                enabled = event.tags.r9k;

                if (enabled === true) {
                    $stateContainer.find('.r9k').show();
                } else {
                    $stateContainer.find('.r9k').hide();
                }
            }

            if ('subs-only' in event.tags) {
                enabled = event.tags['subs-only'];

                if (enabled === true) {
                    $stateContainer.find('.subs-only').show();
                } else {
                    $stateContainer.find('.subs-only').hide();
                }
            }

            if ('emote-only' in event.tags) {
                enabled = event.tags['emote-only'];

                // Twitch isn't properly parsing this.. yet? #fail
                if ([true, '1'].indexOf(enabled) > -1) {
                    $stateContainer.find('.emote-only').show();
                } else {
                    $stateContainer.find('.emote-only').hide();
                }
            }
            break;
        case 'outgoing_message':
            if (!vars.userData.isLoggedIn || bttv.chat.helpers.isModerator(vars.userData.name)) return;

            if (bttv.chat.store.slowTime > 0) {
                initiateCountDown(bttv.chat.store.slowTime);
            } else {
                resetCountDown();
            }
            break;
        case 'notice':
            if (!('msg-id' in event.tags)) return;

            var msg = event.tags['msg-id'];

            if (msg === 'msg_slowmode' || msg === 'msg_timedout') {
                var matches = /\s([0-9]+)/.exec(event.message);
                if (!matches) return;

                var seconds = parseInt(matches[1], 10);
                initiateCountDown(seconds);
            } else if (msg === 'msg_banned') {
                initiateCountDown(86400);
            }
            break;
    }
};
