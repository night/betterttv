const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../settings');
const highlightBlacklistKeywords = require('../chat_highlight_blacklist_keywords');
const chatFontSettings = require('../chat_font_settings');

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

const BETTERTTV_SETTINGS_BUTTON = !$('.twilight-minimal-root').length ? (
    '<button class="openSettings">BetterTTV Settings</button>'
) : '';

const CHAT_SETTINGS_TEMPLATE = `
    <div class="${BTTV_CHAT_SETTINGS_CLASS} tw-border-t tw-mg-t-2 tw-pd-t-2">
        <div class="tw-mg-b-2"><p class="tw-c-text-alt-2 tw-upcase">BetterTTV</p></div>
        <div class="tw-mg-b-1"><button class="setBlacklistKeywords">Set Blacklist Keywords</button></div>
        <div class="tw-mg-b-1"><button class="setHighlightKeywords">Set Highlight Keywords</button></div>
        <div class="tw-mg-b-1"><button class="setFontFamily">Set Font</button></div>
        <div class="tw-mg-b-1"><button class="setFontSize">Set Font Size</button></div>
        <div class="tw-mg-b-1"><button class="clearChat">Clear My Chat</button></div>
        ${BETTERTTV_SETTINGS_BUTTON}
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
        this.renderSettings = this.renderSettings.bind(this);
    }

    load() {
        $('button[data-a-target="chat-settings"]').off('click', this.renderSettings).on('click', this.renderSettings);
    }

    renderSettings() {
        // Hide the settings when in an iframe for now
        if ($(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`).length || inIFrame()) return;

        // Twitch lazy loads settings
        if (!$(CHAT_SETTINGS_SELECTOR).length) {
            setTimeout(() => this.renderSettings(), 100);
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
    }
}

module.exports = new ChatSettingsModule();
