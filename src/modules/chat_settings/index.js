const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../settings');
const highlightBlacklistKeywords = require('../chat_highlight_blacklist_keywords');
const chatFontSettings = require('../chat_font_settings');

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

const CHAT_SETTINGS_TEMPLATE = `
    <div class="${BTTV_CHAT_SETTINGS_CLASS} tw-border-t tw-mg-t-2 tw-pd-t-2">
        <div class="tw-mg-y-05 tw-pd-x-05"><p class="tw-c-text-alt-2 tw-font-size-6 tw-strong tw-upcase">BetterTTV</p></div>
        <div class="tw-full-width tw-relative">
            <button class="setBlacklistKeywords tw-pd-05 tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive">Set Blacklist Keywords</button>
        </div>
        <div class="tw-full-width tw-relative">
            <button class="setHighlightKeywords tw-pd-05 tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive">Set Highlight Keywords</button>
        </div>
        <div class="tw-full-width tw-relative">
            <button class="setFontFamily tw-pd-05 tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive">Set Font</button>
        </div>
        <div class="tw-full-width tw-relative">
            <button class="setFontSize tw-pd-05 tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive">Set Font Size</button>
        </div>
        <div class="tw-full-width tw-relative">
            <button class="clearChat tw-pd-05 tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive">Clear My Chat</button>
        </div>
        <div class="tw-full-width tw-relative">${
    !$('.twilight-minimal-root').length ? (
        '<button class="openSettings tw-pd-05 tw-block tw-border-radius-medium tw-full-width tw-interactable--alpha tw-interactable--hover-enabled tw-interactable tw-interactive">BetterTTV Settings</button>'
    ) : ''}</div>
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
        if (inIFrame()) return;

        let $settings = $(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`);
        // Hide the settings when in an iframe for now
        if ($settings.length) {
            $settings.remove();
        }

        // Twitch lazy loads settings
        if (!$(CHAT_SETTINGS_SELECTOR).length) {
            setTimeout(() => this.renderSettings(), 100);
        }

        $(CHAT_SETTINGS_SELECTOR).append(CHAT_SETTINGS_TEMPLATE);

        $settings = $(CHAT_SETTINGS_SELECTOR).find(`.${BTTV_CHAT_SETTINGS_CLASS}`);

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
