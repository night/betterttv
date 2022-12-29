import $ from 'jquery';
import watcher from '../../watcher.js';
import html from '../../utils/html.js';
import settings from '../settings/index.js';
import chatFontSettings from '../chat_font_settings/index.js';
import domObserver from '../../observers/dom.js';
import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import formatMessage from '../../i18n/index.js';

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const MOD_VIEW_CHAT_SETTINGS_SELECTOR =
  'button[data-test-selector="chat-widget-settings-switch-to-non-mod"], button[data-test-selector="chat-widget-settings-switch-to-default"]';
const CHAT_SETTINGS_BACK_BUTTON_SELECTOR =
  'button[data-test-selector="chat-settings-back-button"], button[data-test-selector="chat-widget-settings-back-button"]';
const CHAT_SETTINGS_MOD_TOOLS_SELECTOR = 'div[data-test-selector="mod-tools"]';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

const CHAT_SETTINGS_TEMPLATE = `
  <div class="${BTTV_CHAT_SETTINGS_CLASS}">
    <div class="settingHeader"><p>${html.escape(formatMessage({defaultMessage: 'BetterTTV'}))}</p></div>
    <div class="settingRow">
      <button borderradius="border-radius-medium" class="settingButton setFontFamily">${html.escape(
        formatMessage({defaultMessage: 'Set Font'})
      )}</button>
    </div>
    <div class="settingRow">
      <button borderradius="border-radius-medium" class="settingButton setFontSize">${html.escape(
        formatMessage({defaultMessage: 'Set Font Size'})
      )}</button>
    </div>
    <div class="settingRow">
      <button borderradius="border-radius-medium" class="settingButton clearChat">${html.escape(
        formatMessage({defaultMessage: 'Clear My Chat'})
      )}</button>
    </div>
    <div class="settingRow">
      <button borderradius="border-radius-medium" class="settingButton openSettings">${html.escape(
        formatMessage({defaultMessage: 'BetterTTV Settings'})
      )}</button>
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

    $settings.find('.setFontFamily').click(chatFontSettings.setFontFamily);
    $settings.find('.setFontSize').click(chatFontSettings.setFontSize);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatSettingsModule()]);
