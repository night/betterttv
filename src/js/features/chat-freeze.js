var helpers = require('../chat/helpers');

var shouldFreeze = false;
var isLoaded = false;

module.exports = function() {
    if (!isLoaded) {
        $('body').on('keydown.chat-freeze', function(e) {
            if (!(e.metaKey || e.ctrlKey) || !$('.chat-room:hover').length) return;
            shouldFreeze = true;
        }).on('keyup.chat-freeze', function(e) {
            if (e.metaKey || e.ctrlKey) return;
            shouldFreeze = false;
            helpers.scrollChat();
            $('.chat-room .chat-interface .more-messages-indicator').click();
        });
        isLoaded = true;
    }

    return shouldFreeze;
};
