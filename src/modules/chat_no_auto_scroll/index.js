const freeze = require('../chat_freeze/index.js');
const settings = require('../../settings');

class ChatNoAutoScroll {
    constructor() {
        settings.add({
            id: 'chatNoAutoScroll',
            name: 'Disable Chat Auto Scroll',
            defaultValue: false,
            description: 'Disables the auto-scroll when scrolling up the chat.'
        });
        settings.on('changed.chatNoAutoScroll', () => this.toggleAutoScroll());
        this.toggleAutoScroll();
    }

    toggleAutoScroll() {
        freeze.setScrollState(!settings.get('chatNoAutoScroll'));
    }
}

module.exports = new ChatNoAutoScroll();
