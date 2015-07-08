var debug = require('../helpers/debug');
var vars = require('../vars');
var template = require('../templates/channel-state');
var chatHelpers = require('../chat/helpers');

var stateContainer = '#bttv-channel-state-contain';
var chatHeader = '.chat-container .chat-header';
var chatButton = '.chat-interface .chat-buttons-container .send-chat-button';

var displaySeconds = function(s) {
    var date = new Date(0);
    date.setSeconds(s);
    date = date.toISOString().substr(11, 8);
    date = date.split(':');

    while(date[0] === '00') {
        date.shift();
    }

    if(date.length === 1 && date[0].charAt(0) === "0") {
        date[0] = parseInt(date[0]);
    }

    return date.join(':');
};

var initiateCountDown = function(length) {
    if(bttv.chat.store.chatCountDown) clearInterval(bttv.chat.store.chatCountDown);

    var timer = length;

    bttv.chat.store.chatCountDown = setInterval(function() {
        var $chatButton = $(chatButton);

        if(timer === 0) {
            clearInterval(bttv.chat.store.chatCountDown);
            bttv.chat.store.chatCountDown = false;
            $chatButton.find('span').text('Chat');
            return;
        }

        $chatButton.find('span').text('Chat in ' + displaySeconds(timer));

        timer--;
    }, 1000);
};

module.exports = function(event) {
    var $stateContainer = $(stateContainer);
    if(!$stateContainer.length) {
        $(chatHeader).append(template());
        $stateContainer = $(stateContainer);
        $stateContainer.children().each(function() {
            $(this).hide();
        });
    }

    switch(event.type) {
        case "roomstate":
            if('slow' in event.tags) {
                var length = parseInt(event.tags['slow']);

                bttv.chat.store.slowTime = length;

                $stateContainer.find('.slow-time').text(displaySeconds(length));

                if(length === 0) {
                    $stateContainer.find('.slow').hide();
                    $stateContainer.find('.slow-time').hide();
                } else {
                    $stateContainer.find('.slow').show();
                    $stateContainer.find('.slow-time').show();
                }
            }

            if('r9k' in event.tags) {
                var enabled = parseInt(event.tags['r9k']);

                if(enabled === 0) {
                    $stateContainer.find('.r9k').hide();
                } else {
                    $stateContainer.find('.r9k').show();
                }
            }

            if('subs-only' in event.tags) {
                var enabled = parseInt(event.tags['subs-only']);

                if(enabled === 0) {
                    $stateContainer.find('.subs-only').hide();
                } else {
                    $stateContainer.find('.subs-only').show();
                }
            }
            break;
        case "outgoing_message":
            if(!vars.userData.isLoggedIn || bttv.chat.helpers.isModerator(vars.userData.login)) return;

            if(bttv.chat.store.slowTime > 0) {
                initiateCountDown(bttv.chat.store.slowTime);
            } else {
                initiateCountDown(2);
            }
            break;
        case "notice":
            if(!('msg-id' in event.tags)) return;

            var msg = event.tags['msg-id'];

            if(msg === 'msg_slowmode' || msg === 'msg_timedout') {
                var matches = /([0-9]+)/.exec(event.message);
                if(!matches) return;

                var seconds = parseInt(matches[1]);
                initiateCountDown(seconds);
            } else if(msg === 'msg_banned') {
                initiateCountDown(86400);
            }
            break;
    }
};
