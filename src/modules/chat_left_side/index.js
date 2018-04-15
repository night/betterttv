const $ = require('jquery');
const settings = require('../../settings');

class ChatLeftSide {
    constructor() {
        settings.add({
            id: 'leftSideChat',
            name: 'Left Side Chat',
            defaultValue: false,
            description: 'Moves the chat to the left of the player'
        });
        settings.on('changed.leftSideChat', () => this.toggleLeftSideChat());
        this.toggleLeftSideChat();
    }

    toggleLeftSideChat() {
        $('body').toggleClass('bttv-swap-chat', settings.get('leftSideChat'));
    }
}

module.exports = new ChatLeftSide();
