const settings = require('../../settings');
const watcher = require('../../watcher');

let alternateBackground = false;

function renderSplitChat($el) {
    if (settings.get('splitChat') === false) return;

    if (alternateBackground) {
        $el.toggleClass('bttv-split-chat-alt-bg');
    }
    alternateBackground = !alternateBackground;
}

class SplitChatModule {
    constructor() {
        settings.add({
            id: 'splitChat',
            name: 'Split Chat',
            defaultValue: false,
            description: 'Easily distinguish between messages from different users in chat'
        });
        watcher.on('chat.message', renderSplitChat);
        watcher.on('vod.message', renderSplitChat);
    }
}

module.exports = new SplitChatModule();
