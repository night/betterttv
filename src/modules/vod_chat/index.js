const $ = require('jquery');
const chat = require('../chat');
const watcher = require('../../watcher');

const CHAT_MESSAGE_SELECTOR = '.vod-message__message';
const CHAT_USERNAME_SELECTOR = '.vod-message__author';
const SCROLL_INDICATOR_SELECTOR = '.vod-chat__sync-button';
const SCROLL_CONTAINER_SELECTOR = '.vod-chat__scroll-wrapper';

function scrollOnEmoteLoad($el) {
    const indicator = $(SCROLL_INDICATOR_SELECTOR).length > 0;
    if (indicator) return;
    $el.find('img.emoticon').on('load', () => {
        const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
        $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
    });
}

class VODChatModule {
    constructor() {
        watcher.on('vod.message', $el => this.parseMessage($el));
    }

    parseMessage($element) {
        const $from = $element.find(CHAT_USERNAME_SELECTOR);
        const mockUser = {name: $from.text()};
        chat.messageReplacer($element.find(CHAT_MESSAGE_SELECTOR), mockUser);

        scrollOnEmoteLoad($element);
    }
}

module.exports = new VODChatModule();
