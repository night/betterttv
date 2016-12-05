var helpers = require('../chat/helpers');

var shouldFreeze = false;
var isLoaded = false;

module.exports = function() {
    if (shouldFreeze === true && bttv.chat.store.activeView !== true) shouldFreeze = false;

    if (isLoaded) return shouldFreeze;

    $('body').on('keydown.chat-freeze', function(e) {
        if (!(e.metaKey || e.ctrlKey) || !$('.chat-room:hover').length) return;
        shouldFreeze = true;
    }).on('keyup.chat-freeze', function(e) {
        if (e.metaKey || e.ctrlKey || !shouldFreeze) return;
        shouldFreeze = false;
        $('.chat-room .chat-interface .more-messages-indicator').click();
        helpers.scrollChat();
    });

    isLoaded = true;

    return false;
};
