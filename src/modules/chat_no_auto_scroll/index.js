const $ = require('jquery');
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
        $('.chat-list__lines > div:nth-child(3) > div:nth-child(1)').off();
    }
}

module.exports = new ChatNoAutoScroll();
