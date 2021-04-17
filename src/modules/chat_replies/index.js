import $ from 'jquery';
import settings from '../../settings.js';

class ChatRepliesModule {
    constructor() {
        settings.add({
            id: 'hideChatReplies',
            name: 'Hide Chat Replies',
            defaultValue: false,
            description: 'Hides the click to reply button in chat'
        });
        settings.on('changed.hideChatReplies', this.toggleChatReplies);
        this.toggleChatReplies();
    }

    toggleChatReplies() {
        $('body').toggleClass('bttv-hide-chat-replies', settings.get('hideChatReplies'));
    }
}

export default new ChatRepliesModule();
