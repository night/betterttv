const $ = require('jquery');
const settings = require('../../settings');

const CHAT_LINE_SELECTOR = '.chat-list__lines .chat-line__message';

class ChatDirection {
    constructor() {
        settings.add({
            id: 'chatDirection',
            name: 'Reverse Chat Messages Direction',
            defaultValue: false,
            description: 'New chat messages come from the top'
        });
        settings.on('changed.chatDirection', () => this.toggleChatDirection());
        this.toggleChatDirection();
    }

    toggleChatDirection() {
        $(CHAT_LINE_SELECTOR).parent().toggleClass('bttv-chat-direction-reversed', settings.get('chatDirection'));
    }
}

module.exports = new ChatDirection();
