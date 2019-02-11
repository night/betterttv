const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

class SplitChatModule {
    constructor() {
        settings.add({
            id: 'splitChat',
            name: 'Split Chat',
            defaultValue: false,
            description: 'Easily distinguish between messages from different users in chat'
        });

        watcher.on('load.chat', () => this.load());
        settings.on('changed.splitChat', () => this.load());
    }

    load() {
        $('body').toggleClass('bttv-split-chat-bg', settings.get('splitChat'));
    }
}

module.exports = new SplitChatModule();
