import watcher from '../../watcher.js';
import settings from '../settings/index.js';
import chatFontSettings from '../chat_font_settings/index.js';
import domObserver from '../../observers/dom.js';
import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import formatMessage from '../../i18n/index.js';

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const MOD_VIEW_CHAT_SETTINGS_SELECTOR =
  'button[data-test-selector="deleted-message-display-setting-item-click-target"], button[data-test-selector="chat-filter-item-click-target"]';
const CHAT_SETTINGS_BACK_BUTTON_SELECTOR =
  'button[data-test-selector="chat-settings-back-button"], button[data-test-selector="chat-widget-settings-back-button"]';
const CHAT_SETTINGS_MOD_TOOLS_SELECTOR = 'div[data-test-selector="mod-tools"]';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';

function createRow(className, label, onClick) {
  const container = document.createElement('div');
  container.classList.add('settingRow');

  const button = document.createElement('button');
  button.classList.add('settingButton', className);
  button.setAttribute('borderradius', 'border-radius-medium');
  button.innerText = label;
  button.addEventListener('click', onClick);
  container.appendChild(button);

  return container;
}

function createSettings(onFontFamilyClick, onFontSizeClick, onClearChatClick, onSettingsClick) {
  const container = document.createElement('div');
  container.classList.add(BTTV_CHAT_SETTINGS_CLASS);

  const headerContainer = document.createElement('div');
  headerContainer.classList.add('settingHeader');
  container.appendChild(headerContainer);

  const header = document.createElement('p');
  header.innerText = formatMessage({defaultMessage: 'BetterTTV'});
  headerContainer.appendChild(header);

  container.appendChild(createRow('setFontFamily', formatMessage({defaultMessage: 'Set Font'}), onFontFamilyClick));
  container.appendChild(createRow('setFontSize', formatMessage({defaultMessage: 'Set Font Size'}), onFontSizeClick));
  container.appendChild(createRow('clearChat', formatMessage({defaultMessage: 'Clear My Chat'}), onClearChatClick));
  container.appendChild(
    createRow('openSettings', formatMessage({defaultMessage: 'BetterTTV Settings'}), onSettingsClick)
  );

  return container;
}

function inIFrame() {
  try {
    return !!window.frameElement;
  } catch (e) {
    return true;
  }
}

function getChatSettings() {
  const modViewChatSettings = document.querySelector(MOD_VIEW_CHAT_SETTINGS_SELECTOR);
  if (modViewChatSettings != null) {
    return modViewChatSettings.parentElement.parentElement;
  }

  return document.querySelector(CHAT_SETTINGS_SELECTOR);
}

function getBetterTTVChatSettings() {
  return getChatSettings()?.querySelector(`.${BTTV_CHAT_SETTINGS_CLASS}`);
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
      getBetterTTVChatSettings()?.remove();
    });
    domObserver.on(CHAT_SETTINGS_MOD_TOOLS_SELECTOR, () => {
      this.renderSettings();
    });
  }

  renderSettings() {
    if (inIFrame()) return;

    const betterttvChatSettings = getBetterTTVChatSettings();
    // Hide the settings when in an iframe for now
    if (betterttvChatSettings != null) {
      betterttvChatSettings.remove();
    }

    // if within a nested menu, do not show bttv settings
    if (document.querySelector(CHAT_SETTINGS_BACK_BUTTON_SELECTOR) != null) {
      return;
    }

    getChatSettings()?.appendChild(
      createSettings(
        chatFontSettings.setFontFamily,
        chatFontSettings.setFontSize,
        (e) => {
          e.preventDefault();
          const messages = document.querySelectorAll(
            '.chat-line__message, .channel-points-reward-line, .user-notice-line'
          );
          for (const message of messages) {
            message.style.display = 'none';
          }
        },
        settings.openSettings
      )
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatSettingsModule()]);
