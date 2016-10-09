var helpers = require('../chat/helpers');

var shouldFreeze = false;
var isLoaded = false;

module.exports = function() {
    if (!isLoaded) {
        $('body').on('keydown.chat-freeze', function(e) {
            if ((e.metaKey || e.ctrlKey) && ($('.chat-room:hover').length !== 0)) {
                shouldFreeze = true;
            }
        });

        $('body').on('keyup.chat-freeze', function(e) {
            if (!(e.metaKey || e.ctrlKey) && shouldFreeze) {
                shouldFreeze = false;
                helpers.scrollChat();
                $('.chat-room .chat-interface .more-messages-indicator').click();
            }
        });

        isLoaded = true;
    }

    return shouldFreeze;
};
