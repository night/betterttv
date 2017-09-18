const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../settings');
const highlightBlacklistKeywords = require('../chat_highlight_blacklist_keywords');
const chatFontSettings = require('../chat_font_settings');

const CHAT_SETTINGS_SELECTOR = '.chat-settings';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

const CHAT_SETTINGS_TEMPLATE = `
    <div class="${BTTV_CHAT_SETTINGS_CLASS} border-t mg-t-2 pd-t-2">
        <div class="mg-b-2"><p class="c-text-alt-2 upcase">BetterTTV</p></div>
        <div class="mg-b-1"><button class="setBlacklistKeywords">Set Blacklist Keywords</button></div>
        <div class="mg-b-1"><button class="setHighlightKeywords">Set Highlight Keywords</button></div>
        <div class="mg-b-1"><button class="setFontFamily">Set Font</button></div>
        <div class="mg-b-1"><button class="setFontSize">Set Font Size</button></div>
        <div class="mg-b-1"><button class="clearChat">Clear My Chat</button></div>
        <button class="openSettings">BetterTTV Settings</button>
    </div>
`;

function inIFrame() {
    try {
        return !!window.frameElement;
    } catch (e) {
        return true;
    }
}

class ChatSettingsModule {
    constructor() {
        watcher.on('load.chat', () => this.load());
    }

    load() {
        $('button[data-a-target="chat-settings"]').off('click', this.renderSettings).on('click', this.renderSettings);
    }

    renderSettings() {
        // Hide the settings when in an iframe for now
        if ($(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`).length || inIFrame()) return;
        $(CHAT_SETTINGS_SELECTOR).append(CHAT_SETTINGS_TEMPLATE);

        const $settings = $(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`);

        $settings.find('.openSettings').click(settings.openSettings);
        $settings.find('.clearChat').click(e => {
            e.preventDefault();
            $('.chat-line').hide();
        });

        $settings.find('.setHighlightKeywords').click(highlightBlacklistKeywords.setHighlightKeywords);
        $settings.find('.setBlacklistKeywords').click(highlightBlacklistKeywords.setBlacklistKeywords);

        $settings.find('.setFontFamily').click(chatFontSettings.setFontFamily);
        $settings.find('.setFontSize').click(chatFontSettings.setFontSize);

        // make the chat settings scrollable
        $(CHAT_SETTINGS_SELECTOR).css('max-height', $(window).height() - 100);
    }
}

module.exports = new ChatSettingsModule();
