const $ = require('jquery');
const chat = require('../chat');
const nicknames = require('../chat_nicknames');
const watcher = require('../../watcher');
const colors = require('../../utils/colors');

const CHAT_MESSAGE_SELECTOR = '.video-chat__message span[data-a-target="chat-message-text"]';
const CHAT_FROM_SELECTOR = '.video-chat__message-author';
const CHAT_USER_SELECTOR = '.chat-author__display-name,.chat-author__intl-login';
const SCROLL_INDICATOR_SELECTOR = '.video-chat__sync-button';
const SCROLL_CONTAINER_SELECTOR = '.video-chat__message-list-wrapper';
const COLOR_REGEX = /rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/;

function scrollOnEmoteLoad($el) {
    const indicator = $(SCROLL_INDICATOR_SELECTOR).length > 0;
    if (indicator) return;
    $el.find('img.bttv').on('load', () => {
        const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
        $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
    });
}

class VODChatModule {
    constructor() {
        watcher.on('vod.message', $el => this.parseMessage($el));
        watcher.on('load.vod', () => $('textarea[data-a-target="video-chat-input"]').attr('maxlength', '500'));
    }

    parseMessage($element) {
        const $from = $element.find(CHAT_FROM_SELECTOR);
        const $username = $from.find(CHAT_USER_SELECTOR);

        const colorRaw = $username.css('color');
        const colorRgb = COLOR_REGEX.exec(colorRaw);
        const color = colorRgb ? colors.getHex({r: colorRgb[1], g: colorRgb[2], b: colorRgb[3]}) : null;

        const mockUser = {
            name: $from.attr('href').split('?')[0].split('/').pop(),
            color
        };

        if (mockUser.color) {
            const newColor = chat.calculateColor(mockUser.color);
            $username.css('color', newColor);

            const messageStyle = $element.attr('style');
            if (messageStyle && messageStyle.includes('color:')) {
                $element.css('color', newColor);
            }
        }

        const nickname = nicknames.get(mockUser.name);
        if (nickname) {
            $username.text(nickname);
        }

        const $message = $element.find(CHAT_MESSAGE_SELECTOR);
        chat.messageReplacer($message, mockUser);

        scrollOnEmoteLoad($element);
    }
}

module.exports = new VODChatModule();
