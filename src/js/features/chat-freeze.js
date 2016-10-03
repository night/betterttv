var helpers = require('../chat/helpers');

var shouldFreeze = false;

$('body').on('keydown.chat-freeze', function(e) {
    if (e.metaKey && ($('.chat-room:hover').length !== 0)) {
        shouldFreeze = true;
    }
});

$('body').on('keyup.chat-freeze', function(e) {
    if (!e.metaKey && shouldFreeze) {
        shouldFreeze = false;
        helpers.scrollChat();
        $('.chat-room .chat-interface .more-messages-indicator').click();
    }
});

module.exports = function() {
    return shouldFreeze;
};
