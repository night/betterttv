const $ = require('jquery');
const settings = require('../settings');
const highlightBlacklistKeywords = require('../chat_highlight_blacklist_keywords');
const chatFontSettings = require('../chat_font_settings');
const chatScrollbackSettings = require('../chat_scrollback_settings');

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

const CHAT_SETTINGS_TEMPLATE = `
    <div class="${BTTV_CHAT_SETTINGS_CLASS} tw-border-t tw-mg-t-2 tw-pd-t-2">
        <div class="tw-mg-b-2"><p class="tw-c-text-alt-2 tw-upcase">BetterTTV</p></div>
        <div class="tw-mg-b-1"><button class="setBlacklistKeywords">Set Blacklist Keywords</button></div>
        <div class="tw-mg-b-1"><button class="setHighlightKeywords">Set Highlight Keywords</button></div>
        <div class="tw-mg-b-1"><button class="setFontFamily">Set Font</button></div>
        <div class="tw-mg-b-1"><button class="setFontSize">Set Font Size</button></div>
        <div class="tw-mg-b-1"><button class="setChatScrollbackSize">Set Chat Scrollback Size</button></div>
        <div class="tw-mg-b-1"><button class="clearChat">Clear My Chat</button></div>
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

function renderSettings() {
    // Hide the settings when in an iframe for now
    if ($(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`).length || inIFrame()) return;

    // Twitch lazy loads settings
    if (!$(CHAT_SETTINGS_SELECTOR).length) {
        setTimeout(renderSettings, 100);
        return;
    }

    $(CHAT_SETTINGS_SELECTOR).append(CHAT_SETTINGS_TEMPLATE);

    const $settings = $(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`);

    $settings.find('.openSettings').click(settings.openSettings);
    $settings.find('.clearChat').click(e => {
        e.preventDefault();
        $('.chat-line__message').hide();
    });
    $settings.find('.setHighlightKeywords').click(highlightBlacklistKeywords.setHighlightKeywords);
    $settings.find('.setBlacklistKeywords').click(highlightBlacklistKeywords.setBlacklistKeywords);

    $settings.find('.setFontFamily').click(chatFontSettings.setFontFamily);
    $settings.find('.setFontSize').click(chatFontSettings.setFontSize);
    $settings.find('.setChatScrollbackSize').click(chatScrollbackSettings.setChatScrollbackSize);
}

class ChatSettingsModule {
    constructor() {
        $('body').on('click.renderChatSettings', 'button[data-a-target="chat-settings"]', renderSettings);
    }
}

module.exports = new ChatSettingsModule();
