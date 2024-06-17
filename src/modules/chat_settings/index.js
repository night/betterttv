import debounce from 'lodash.debounce';
import {PlatformTypes} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import domObserver from '../../observers/dom.js';
import storage from '../../storage.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';
import chatFontSettings from '../chat_font_settings/index.js';
import settings from '../settings/index.js';

const CHAT_SETTINGS_SELECTOR = '.chat-settings__content';
const MOD_VIEW_PAGE_SELECTOR = '.moderation-view-page';
const MOD_VIEW_CHAT_SETTINGS_SELECTOR =
  '#chat-settings-show-mod-actions, [data-test-selector="chat-filter-item-click-target"]';
const CHAT_SETTINGS_BACK_BUTTON_SELECTOR =
  'button[data-test-selector="chat-settings-back-button"], button[data-test-selector="chat-widget-settings-back-button"], .chat-widget-settings__header-button-container';
const CHAT_SETTINGS_MOD_TOOLS_SELECTOR = 'div[data-test-selector="mod-tools"]';
const BTTV_CHAT_SETTINGS_CLASS = 'bttv-chat-settings';
let oldChatSettings;

function createRow(className, leftLabel, onClick, rightLabel = null) {
  const container = document.createElement('div');
  container.classList.add('settingRow');

  const button = document.createElement('button');
  button.classList.add('settingButton', className);
  button.setAttribute('borderradius', 'border-radius-medium');

  const leftLabelContainer = document.createElement('div');
  leftLabelContainer.innerText = leftLabel;
  button.appendChild(leftLabelContainer);

  if (rightLabel != null) {
    button.classList.add('settingButtonMultipleLabels');
    const rightLabelContainer = document.createElement('div');
    rightLabelContainer.innerText = rightLabel;
    button.appendChild(rightLabelContainer);
  }

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

  container.appendChild(
    createRow(
      'setFontFamily',
      formatMessage({defaultMessage: 'Set Font'}),
      onFontFamilyClick,
      storage.get('chatFontFamily')
    )
  );
  const chatFontSize = storage.get('chatFontSize');
  container.appendChild(
    createRow(
      'setFontSize',
      formatMessage({defaultMessage: 'Set Font Size'}),
      onFontSizeClick,
      chatFontSize != null && chatFontSize !== '' ? `${chatFontSize}px` : null
    )
  );
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

function getNativeChatSettings() {
  const modViewChatSettings = document.querySelector(MOD_VIEW_CHAT_SETTINGS_SELECTOR);
  if (document.querySelector(MOD_VIEW_PAGE_SELECTOR) != null && modViewChatSettings != null) {
    return modViewChatSettings.closest('.tw-balloon').querySelector('button').parentElement.parentElement;
  }

  return document.querySelector(CHAT_SETTINGS_SELECTOR);
}

const renderChatSettings = debounce(
  () => {
    // Hide the settings when in an iframe for now
    if (inIFrame()) {
      return;
    }

    // The Twitch settings render views in the same container, so we need to remove the old settings
    // and re-append the new settings when there's re-rendering
    if (oldChatSettings != null) {
      oldChatSettings.remove();
    }

    // If the main chat settings are not visible, don't render the BetterTTV settings
    if (document.querySelector(CHAT_SETTINGS_BACK_BUTTON_SELECTOR) != null) {
      return;
    }

    const nativeChatSettings = getNativeChatSettings();
    if (nativeChatSettings == null) {
      return;
    }

    oldChatSettings = nativeChatSettings.appendChild(
      createSettings(
        () => {
          chatFontSettings.setFontFamily();
          this.renderSettings();
        },
        () => {
          chatFontSettings.setFontSize();
          this.renderSettings();
        },
        (e) => {
          e.preventDefault();
          const messages = document.querySelectorAll(
            '.chat-line__message, .channel-points-reward-line, .user-notice-line'
          );
          for (const message of messages) {
            message.style.display = 'none';
          }
        },
        () => {
          settings.openSettings();
          document.querySelector('button[data-test-selector="chat-settings-close-button-selector"]')?.click?.();
          document.querySelector('button[aria-expanded="true"]')?.click?.();
        }
      )
    );
  },
  250,
  {leading: true, trailing: true}
);

class ChatSettingsModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
  }

  load() {
    domObserver.on(CHAT_SETTINGS_SELECTOR, () => renderChatSettings());
    domObserver.on(MOD_VIEW_CHAT_SETTINGS_SELECTOR, () => renderChatSettings());
    domObserver.on(CHAT_SETTINGS_BACK_BUTTON_SELECTOR, () => renderChatSettings());
    domObserver.on(CHAT_SETTINGS_MOD_TOOLS_SELECTOR, () => renderChatSettings());
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatSettingsModule()]);
