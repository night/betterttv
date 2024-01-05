import React from 'react';
import {createRoot} from 'react-dom/client';
import {EmoteMenuTypes, SettingIds} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import twitch from '../../../utils/twitch.js';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';
import EmoteMenuButton from '../components/Button.jsx';
import styles from './EmoteMenu.module.css';

const CONTAINER_QUERY_SELECTOR = '#root';
const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-legacy-emote-picker-button-container';
const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';

const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-emote-picker-button-container';
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
    legacyContainer = document.getElementById(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  }
  if (legacyContainer != null) {
    legacyContainer.remove();
  }
  if (legacyMountedRoot != null) {
    legacyMountedRoot.unmount();
  }
}

function loadLegacyButton() {
  const legacyContainer = document.getElementById(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  if (legacyContainer != null) {
    return;
  }

  const container = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);
  if (container == null) {
    return;
  }

  const rightContainer = container.lastChild;
  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('id', LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  rightContainer.insertBefore(buttonContainer, rightContainer.lastChild);

  if (legacyMountedRoot != null) {
    legacyMountedRoot.unmount();
  }

  legacyMountedRoot = createRoot(buttonContainer);
  legacyMountedRoot.render(
    <SafeEmoteMenuButton
      isLegacy
      onError={() => unloadLegacyButton(legacyContainer)}
      appendToChat={appendToChat}
      className={styles.button}
      boundingQuerySelector={CHAT_TEXT_AREA}
    />
  );
}

function unloadButton(container, nativeEmotePickerButton) {
  if (container === undefined) {
    container = document.getElementById(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  }
  if (nativeEmotePickerButton === undefined) {
    nativeEmotePickerButton = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR);
  }
  if (nativeEmotePickerButton != null) {
    nativeEmotePickerButton.classList.remove(styles.hideEmoteMenuButton);
  }
  if (container != null) {
    container.remove();
  }
  if (mountedRoot != null) {
    mountedRoot.unmount();
  }
}

function loadButton() {
  const container = document.getElementById(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  if (container != null) {
    return;
  }

  const nativeEmotePickerButton = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR);
  if (nativeEmotePickerButton == null) {
    return;
  }

  const chatInputIcons = nativeEmotePickerButton?.parentElement?.parentElement;
  const chatInputIconsStyle = chatInputIcons != null ? window.getComputedStyle(chatInputIcons) : null;
  const chatInputIconsParent = chatInputIcons?.parentElement;
  const chatInputIconsParentStyle = chatInputIconsParent != null ? window.getComputedStyle(chatInputIconsParent) : null;

  if (
    chatInputIcons == null ||
    !(parseInt(chatInputIconsStyle.paddingRight, 10) > 0 && parseInt(chatInputIconsStyle.paddingBottom, 10) > 0) ||
    chatInputIconsParent == null ||
    !(
      chatInputIconsParentStyle.position === 'absolute' &&
      parseInt(chatInputIconsParentStyle.right, 10) === 0 &&
      parseInt(chatInputIconsParentStyle.bottom, 10) === 0
    )
  ) {
    return;
  }

  nativeEmotePickerButton.classList.add(styles.hideEmoteMenuButton);
  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('id', BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  buttonContainer.classList.add(styles.container);
  chatInputIcons.appendChild(buttonContainer);

  if (mountedRoot != null) {
    mountedRoot.unmount();
  }

  mountedRoot = createRoot(buttonContainer);
  mountedRoot.render(
    <SafeEmoteMenuButton
      onError={() => unloadButton(buttonContainer, nativeEmotePickerButton)}
      appendToChat={appendToChat}
      className={styles.button}
      containerQuerySelector={CONTAINER_QUERY_SELECTOR}
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
