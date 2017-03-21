const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../settings');
const highlightBlacklistKeywords = require('../chat_highlight_blacklist_keywords');
const chatFontSettings = require('../chat_font_settings');

const CHAT_SETTINGS_SELECTOR = '.ember-chat .chat-interface .chat-settings';
const BTTV_CHAT_SETTINGS_CLASS = 'bttvChatSettings';

const CHAT_SETTINGS_TEMPLATE = `
<div class="${BTTV_CHAT_SETTINGS_CLASS}">
    <div class="list-header">BetterTTV</div>
    <div class="chat-menu-content">
        <p><a class="setBlacklistKeywords" href="#">Set Blacklist Keywords</a></p>
        <p><a class="setHighlightKeywords" href="#">Set Highlight Keywords</a></p>
        <p><a class="setFontFamily" href="#">Set Font</a></p>
        <p><a class="setFontSize" href="#">Set Font Size</a></p>
        <p><a class="clearChat" href="#">Clear My Chat</a></p>
        <p><a class="button-simple dark openSettings" href="#" style="display: block;margin-top: 8px;text-align: center;">BetterTTV Settings</a></p>
    </div>
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
        watcher.on('load.chat_settings', () => this.load());
    }

    load() {
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
