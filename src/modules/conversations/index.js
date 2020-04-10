const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const chat = require('../chat');

const CHAT_USER_SELECTOR = '.thread-message__message--user-name';
const CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';
const SCROLL_CONTAINER_SELECTOR = '.simplebar-scroll-content';

function scrollOnEmoteLoad($el) {
    $el.find('img.bttv').on('load', () => {
        const $scrollContainer = $el.closest(SCROLL_CONTAINER_SELECTOR);
        $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
    });
}

class ConversationsModule {
    constructor() {
        settings.add({
            id: 'disableWhispers',
            name: 'Hide Whispers',
            defaultValue: false,
            description: 'Disables Twitch whispers and hides any whispers you receive'
        });
        settings.on('changed.disableWhispers', () => this.toggleHide());
        watcher.on('load', () => this.toggleHide());
        watcher.on('conversation.message', ($el, message) => this.parseMessage($el, message));
    }

    toggleHide() {
        $('body').toggleClass('bttv-hide-conversations', settings.get('disableWhispers'));
    }

    parseMessage($element, message) {
        const $from = $element.find(CHAT_USER_SELECTOR);
        if (!message.from) return;
        const {id, login: name, displayName, chatColor: color} = message.from;
        const mockUser = {
            id,
            name,
            displayName,
            color
        };
        $from.css('color', chat.calculateColor(mockUser.color));

        const $message = $element.find(CHAT_MESSAGE_SELECTOR);
        chat.messageReplacer($message, mockUser);

        scrollOnEmoteLoad($element);
    }
}

module.exports = new ConversationsModule();
