import $ from 'jquery';
import watcher from '../../watcher.js';
import settings from '../settings/index.js';
import highlightBlacklistKeywords from '../chat_highlight_blacklist_keywords/index.js';
import chatFontSettings from '../chat_font_settings/index.js';
import domObserver from '../../observers/dom.js';

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const MOD_VIEW_CHAT_SETTINGS_SELECTOR =
  'button[data-test-selector="chat-widget-settings-switch-to-non-mod"], button[data-test-selector="chat-widget-settings-switch-to-default"]';
const CHAT_SETTINGS_BACK_BUTTON_SELECTOR =
  'button[data-test-selector="chat-settings-back-button"], button[data-test-selector="chat-widget-settings-back-button"]';
const CHAT_SETTINGS_MOD_TOOLS_SELECTOR = 'div[data-test-selector="mod-tools"]';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

const CHAT_SETTINGS_TEMPLATE = `
    <div class="${BTTV_CHAT_SETTINGS_CLASS} bttv-chat-settings-container">
        <div class="bttv-chat-settings-header-container">
          <p class="bttv-chat-settings-header-text">BetterTTV</p>
        </div>
        <div class="bttv-chat-setting">
            <button class="setBlacklistKeywords bttv-chat-setting-button tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive">Set Blacklist Keywords</button>
        </div>
        <div class="bttv-chat-setting">
            <button class="setHighlightKeywords bttv-chat-setting-button tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive">Set Highlight Keywords</button>
        </div>
        <div class="bttv-chat-setting">
            <button class="setFontFamily bttv-chat-setting-button tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive">Set Font</button>
        </div>
        <div class="bttv-chat-setting">
            <button class="setFontSize bttv-chat-setting-button tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive">Set Font Size</button>
        </div>
        <div class="bttv-chat-setting">
            <button class="clearChat bttv-chat-setting-button tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive">Clear My Chat</button>
        </div>
        <div class="bttv-chat-setting">${
          !$('.twilight-minimal-root').length
            ? '<button class="openSettings bttv-chat-setting-button tw-interactable--default tw-interactable--hover-enabled tw-interactable tw-interactive">BetterTTV Settings</button>'
            : ''
        }</div>
    </div>
`;

function inIFrame() {
  try {
    return !!window.frameElement;
  } catch (e) {
    return true;
  }
}

function getChatSettings() {
  const $modViewChatSettings = $(MOD_VIEW_CHAT_SETTINGS_SELECTOR);
  if ($modViewChatSettings.length > 0) {
    return $modViewChatSettings.parent();
  }

  const $chatSettings = $(CHAT_SETTINGS_SELECTOR);
  return $chatSettings;
}

function getSettings() {
  return getChatSettings().find(`.${BTTV_CHAT_SETTINGS_CLASS}`);
}

class ChatSettingsModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
    this.renderSettings = this.renderSettings.bind(this);
  }

  load() {
    domObserver.on(CHAT_SETTINGS_SELECTOR, (node, isConnected) => {
      if (!isConnected) return;
      this.renderSettings();
    });
    domObserver.on(MOD_VIEW_CHAT_SETTINGS_SELECTOR, () => {
      this.renderSettings();
    });
    domObserver.on(CHAT_SETTINGS_BACK_BUTTON_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        this.renderSettings();
        return;
      }
      getSettings().remove();
    });
    domObserver.on(CHAT_SETTINGS_MOD_TOOLS_SELECTOR, () => {
      this.renderSettings();
    });
  }

  renderSettings() {
    if (inIFrame()) return;

    let $settings = getSettings();
    // Hide the settings when in an iframe for now
    if ($settings.length) {
      $settings.remove();
    }

    // if within a nested menu, do not show bttv settings
    if ($(CHAT_SETTINGS_BACK_BUTTON_SELECTOR).length > 0) {
      return;
    }

    getChatSettings().append(CHAT_SETTINGS_TEMPLATE);

    $settings = getSettings();

    $settings.find('.openSettings').click(settings.openSettings);
    $settings.find('.clearChat').click((e) => {
      e.preventDefault();
      $('.chat-line__message, .channel-points-reward-line, .user-notice-line').hide();
    });

    $settings.find('.setHighlightKeywords').click(highlightBlacklistKeywords.setHighlightKeywords);
    $settings.find('.setBlacklistKeywords').click(highlightBlacklistKeywords.setBlacklistKeywords);

    $settings.find('.setFontFamily').click(chatFontSettings.setFontFamily);
    $settings.find('.setFontSize').click(chatFontSettings.setFontSize);
  }
}

export default new ChatSettingsModule();
