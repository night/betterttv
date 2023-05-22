import React from 'react';
import {createRoot} from 'react-dom/client';
import settings from '../../../settings.js';
import {EmoteMenuTypes, SettingIds} from '../../../constants.js';
import EmoteMenuButton from '../components/LegacyButton.jsx';
import domObserver from '../../../observers/dom.js';
import styles from './EmoteMenu.module.css';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';
import twitch from '../../../utils/twitch.js';

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR =
  'div[data-a-target="legacy-bttv-emote-picker-button-container"]';
const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';

const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR = 'div[data-a-target="bttv-emote-picker-button-container"]';
const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';

class SafeEmoteMenuButton extends React.Component {
  componentDidCatch(error, info) {
    const {onError} = this.props;
    onError(error, info);
  }

  static getDerivedStateFromError() {
    return null;
  }

  render() {
    return <EmoteMenuButton {...this.props} />;
  }
}

let mountedRoot;
let legacyMountedRoot;

function appendToChat({code: text}, shouldFocus = true) {
  let prefixText = twitch.getChatInputValue();

  // suffix the prefix with a space if it needs one
  if (prefixText.length > 0 && !prefixText.endsWith(' ')) {
    prefixText += ' ';
  }

  twitch.setChatInputValue(`${prefixText}${text} `, shouldFocus);
}

function unloadLegacyButton(legacyContainer) {
  if (legacyContainer === undefined) {
    legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
  }
  if (legacyContainer != null) {
    legacyContainer.remove();
  }
  if (legacyMountedRoot != null) {
    legacyMountedRoot.unmount();
  }
}

function loadLegacyButton() {
  const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
  if (legacyContainer != null) {
    return;
  }

  const container = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);
  if (container == null) {
    return;
  }

  const rightContainer = container.lastChild;
  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
  rightContainer.insertBefore(buttonContainer, rightContainer.lastChild);

  if (legacyMountedRoot != null) {
    legacyMountedRoot.unmount();
  }

  legacyMountedRoot = createRoot(buttonContainer);
  legacyMountedRoot.render(
    <SafeEmoteMenuButton
      onError={() => unloadLegacyButton(legacyContainer)}
      appendToChat={appendToChat}
      className={styles.button}
      boundingQuerySelector={CHAT_TEXT_AREA}
    />
  );
}

function unloadButton(container, chatInputIcons) {
  if (container === undefined) {
    container = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
  }
  if (chatInputIcons === undefined) {
    chatInputIcons = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR)?.parentElement?.parentElement;
  }
  if (chatInputIcons != null) {
    chatInputIcons.classList.remove(styles.chatInputIcon);
  }
  if (container != null) {
    container.remove();
  }
  if (mountedRoot != null) {
    mountedRoot.unmount();
  }
}

function loadButton() {
  const container = document.querySelector(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
  if (container != null) {
    return;
  }

  const chatInputIcons = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR)?.parentElement?.parentElement;
  if (chatInputIcons == null) {
    return;
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('data-a-target', 'bttv-emote-picker-button-container');
  chatInputIcons.classList.add(styles.chatInputIcon);
  chatInputIcons.appendChild(buttonContainer);

  if (mountedRoot != null) {
    mountedRoot.unmount();
  }

  mountedRoot = createRoot(buttonContainer);
  mountedRoot.render(
    <SafeEmoteMenuButton
      onError={() => unloadButton(buttonContainer, chatInputIcons)}
      appendToChat={appendToChat}
      className={styles.button}
      boundingQuerySelector={CHAT_TEXT_AREA}
    />
  );
}

export default class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.load();
    });
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.load());
  }

  load() {
    if (getCurrentUser() == null) {
      return;
    }

    switch (settings.get(SettingIds.EMOTE_MENU)) {
      case EmoteMenuTypes.ENABLED:
        unloadLegacyButton();
        loadButton();
        break;
      case EmoteMenuTypes.LEGACY_ENABLED:
        loadLegacyButton();
        unloadButton();
        break;
      default:
        unloadLegacyButton();
        unloadButton();
        break;
    }
  }
}
