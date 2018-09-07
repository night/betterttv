const $ = require('jquery');
const chat = require('../chat');
const colors = require('../../utils/colors');
const settings = require('../../settings');
const watcher = require('../../watcher');

const GIF_EMOTES_SETTINGS_KEY = 'bttvGIFEmotes';
const CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';
const CHAT_USERNAME_SELECTOR = 'a span.tw-strong';
const SCROLL_INDICATOR_SELECTOR = '.clips-chat .clips-chat__content button.tw-button--small';
const SCROLL_CONTAINER_SELECTOR = '.clips-chat .simplebar-scroll-content';

function parseColor(rgbText) {
    const rgb = ((rgbText || '').split(')')[0].split('rgb(')[1] || '').split(',');
    const sanitize = c => parseInt((c || '0').trim(), 10);
    return {
        r: sanitize(rgb[0]),
        g: sanitize(rgb[1]),
        b: sanitize(rgb[2])
    };
}

function scrollOnEmoteLoad($el) {
    const indicator = $(SCROLL_INDICATOR_SELECTOR).length > 0;
    if (indicator) return;
    $el.find('img').on('load', () => {
        const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
        $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
    });
}

class ClipsModule {
    constructor() {
        watcher.on('load.clips', () => this.load());
        watcher.on('clips.message', $el => this.parseMessage($el));
    }

    load() {
        // force enable GIF emotes since clips does not have real settings
        if (settings.get(GIF_EMOTES_SETTINGS_KEY) === false) {
            settings.set(GIF_EMOTES_SETTINGS_KEY, true);
        }
    }

    parseMessage($element) {
        const $from = $element.find(CHAT_USERNAME_SELECTOR);
        const oldColor = colors.getHex(parseColor($from.css('color')));
        $from.attr('style', `color: ${chat.calculateColor(oldColor)}`);

        const mockUser = {name: $from.text()};
        chat.messageReplacer($element.find(CHAT_MESSAGE_SELECTOR), mockUser);

        scrollOnEmoteLoad($element);
    }
}

module.exports = new ClipsModule();
