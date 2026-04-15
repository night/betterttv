import React from 'react';
import {EmoteMenuTypes, SettingIds} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import twitch from '../../../utils/twitch.js';
import {getCurrentUser} from '../../../utils/user.js';
import watcher from '../../../watcher.js';
import styles from './EmoteMenu.module.css';
import EmoteMenu from '../components/EmoteMenu.jsx';
import shadowDOM from '../../shadow_dom/index.js';

const CHAT_TEXT_AREA = '.chat-input__textarea, textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const CHAT_INPUT = '.chat-input';
const EMOTE_MENU_COMPONENT_ID = 'emote-menu-component';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-legacy-emote-picker-button-container';
const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';

const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-emote-picker-button-container';
const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';

let handleOpen;
function setHandleOpen(newHandleOpen) {
  handleOpen = newHandleOpen;
}

class SafeEmoteMenu extends React.Component {
  componentDidMount() {
    const {onMount} = this.props;
    onMount();
  }

  componentDidCatch(error, info) {
    const {onError} = this.props;
    onError(error, info);
  }

  static getDerivedStateFromError() {
    return null;
  }

  render() {
    return <EmoteMenu {...this.props} />;
  }
}

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

  const button = document.createElement('button');
  button.classList.add(styles.legacyButton);
  buttonContainer.appendChild(button);
  button.addEventListener('click', () => handleOpen?.());
}

function unloadButton(container, chatInput) {
  if (container === undefined) {
    container = document.getElementById(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  }
  if (chatInput === undefined) {
    chatInput = document.querySelector(CHAT_INPUT);
  }
  if (chatInput != null) {
    chatInput.classList.remove(styles.hideEmoteMenuButtonContainer);
  }
  if (container != null) {
    container.remove();
  }
}

function loadButton() {
  const container = document.getElementById(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  if (container != null) {
    return;
  }

  const chatInput = document.querySelector(CHAT_INPUT);
  const nativeEmotePickerButton = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR);
  if (nativeEmotePickerButton == null || chatInput == null) {
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

  chatInput.classList.add(styles.hideEmoteMenuButtonContainer);
  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('id', BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  buttonContainer.classList.add(styles.container);
  chatInputIcons.appendChild(buttonContainer);

  const button = document.createElement('button');
  button.classList.add(styles.button);
  buttonContainer.appendChild(button);
  button.addEventListener('click', () => handleOpen?.());
}

function unloadEmoteMenu() {
  shadowDOM.unmount(EMOTE_MENU_COMPONENT_ID);
}

function loadEmoteMenu(onMount, onError) {
  if (shadowDOM.isMounted(EMOTE_MENU_COMPONENT_ID)) {
    onMount();
  }

  shadowDOM.mount(
    EMOTE_MENU_COMPONENT_ID,
    <SafeEmoteMenu
      onError={onError}
      onMount={onMount}
      setHandleOpen={setHandleOpen}
      appendToChat={appendToChat}
      boundingQuerySelector={CHAT_TEXT_AREA}
      offsetOptions={{mainAxis: 8}}
    />
  );
}

class EmoteMenuModule {
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
        loadEmoteMenu(loadButton, unloadButton);
        break;
      case EmoteMenuTypes.LEGACY_ENABLED:
        unloadButton();
        loadEmoteMenu(loadLegacyButton, unloadLegacyButton);
        break;
      default:
      case EmoteMenuTypes.NONE:
        unloadButton();
        unloadLegacyButton();
        unloadEmoteMenu();
        break;
    }
  }
}

export default EmoteMenuModule;
