const $ = require('jquery');
const chat = require('../chat');
const css = require('../../utils/css');
const colors = require('../../utils/colors');
const settings = require('../../settings');
const watcher = require('../../watcher');

const GIF_EMOTES_SETTINGS_KEY = 'bttvGIFEmotes';
const SETTING_KEY = 'darkenedMode';
const DARK_CLASS = 'dark';
const CHAT_MESSAGE_SELECTOR = '.clip-chat-message';
const CHAT_USERNAME_SELECTOR = '.clip-chat-username';
const SCROLL_INDICATOR_SELECTOR = '.view-clip__scrollButton';
const SCROLL_CONTAINER_SELECTOR = '.view-clip__main';

const $body = $('body');
const $html = $('html');

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
    $el.find('img.emoticon').on('load', () => {
        const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
        $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
    });
}

class GlobalCSSModule {
    constructor() {
        watcher.on('load.clips', () => this.load());
        watcher.on('clips.message', $el => this.parseMessage($el));
    }

    load() {
        css.load('clips-dark');
        this.darkenToggleButton();

        // force enable GIF emotes since clips does not have real settings
        if (settings.get(GIF_EMOTES_SETTINGS_KEY) === false) {
            settings.set(GIF_EMOTES_SETTINGS_KEY, true);
        }

        if (!settings.get(SETTING_KEY)) return;
        $html.addClass(DARK_CLASS);
    }

    darkenToggleButton() {
        const toggleButton = $('<a />');
        toggleButton.addClass('darkToggleButton');
        toggleButton.text('Toggle Dark Mode');
        toggleButton.on('click', () => this.toggleDarkMode());
        $body.append(toggleButton);
    }

    toggleDarkMode() {
        const newValue = !(settings.get(SETTING_KEY) || false);
        $html.toggleClass(DARK_CLASS, newValue);
        settings.set(SETTING_KEY, newValue);
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

module.exports = new GlobalCSSModule();
