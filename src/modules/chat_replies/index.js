const $ = require('jquery');
const settings = require('../../settings');

class ChatRepliesModule {
    constructor() {
        settings.add({
            id: 'chatReplies',
            name: 'Chat Replies',
            defaultValue: true,
            description: 'Toggles click to reply in chat'
        });
        settings.on('changed.chatReplies', () => this.toggleChatReplies());
        this.toggleChatReplies();
    }

    toggleChatReplies() {
        $('body').toggleClass('bttv-hide-chat-replies', !settings.get('chatReplies'));
    }
}

module.exports = new ChatRepliesModule();
