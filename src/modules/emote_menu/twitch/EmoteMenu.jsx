import React from 'react';
import iconButtonStyles from '@/common/styles/IconButton.module.css';
import {ChatLayoutTypes, EmoteMenuTypes, SettingIds, ShadowDOMComponentIds} from '@/constants';
import formatMessage from '@/i18n/index';
import EmoteMenu from '@/modules/emote_menu/components/EmoteMenu';
import shadowDOM from '@/modules/shadow_dom/index';
import {bindTooltip} from '@/modules/tooltip/index';
import domObserver from '@/observers/dom';
import settings from '@/settings';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import {isStandaloneWindow} from '@/utils/window';
import watcher from '@/watcher';
import styles from './EmoteMenu.module.css';

const CHAT_TEXT_AREA = '.chat-input__textarea, textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const CHAT_INPUT = '.chat-input';

// For legacy button
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-legacy-emote-picker-button-container';
const CHAT_INPUT_BUTTONS_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';
const CHAT_SETTINGS_BUTTON_SELECTOR = 'button[data-a-target="chat-settings"]';
const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = `div:has(${CHAT_SETTINGS_BUTTON_SELECTOR})`;
const CHAT_SEND_BUTTON_SELECTOR = 'button[data-a-target="chat-send-button"]';

const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-emote-picker-button-container';
const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';
const EMOTE_MENU_TOGGLE_BUTTON_SELECTOR = `#${BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID}, #${LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID}`;

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
  const chatInput = document.querySelector(CHAT_INPUT);
  if (chatInput != null) {
    chatInput.classList.remove(styles.hideShieldModeButton);
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

  const buttonsContainer = document.querySelector(CHAT_INPUT_BUTTONS_CONTAINER_SELECTOR);
  if (buttonsContainer == null) {
    return;
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('id', LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);

  const chatSettingsButtonContainer = buttonsContainer.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);

  if (chatSettingsButtonContainer != null) {
    // Regular chat: place the button alongside the chat settings button.
    chatSettingsButtonContainer.after(buttonContainer);
  } else {
    // Moderator view doesn't expose a chat settings button, so place the button next to the
    // send button instead.
    const chatSendButton = buttonsContainer.querySelector(CHAT_SEND_BUTTON_SELECTOR);
    const chatSendButtonContainer = [...buttonsContainer.children].find((child) => child.contains(chatSendButton));
    if (chatSendButtonContainer == null) {
      return;
    }
    buttonsContainer.insertBefore(buttonContainer, chatSendButtonContainer);
  }

  // In regular chat the moderator shield mode button shares the row with the chat settings
  // button, leaving no room for the emote menu button, so hide it. Moderator view has no chat
  // settings button and enough room, so the shield mode button stays visible there.
  const chatInput = document.querySelector(CHAT_INPUT);
  if (chatInput != null && chatSettingsButtonContainer != null) {
    chatInput.classList.add(styles.hideShieldModeButton);
  }

  const button = document.createElement('button');
  button.classList.add(iconButtonStyles.button);
  buttonContainer.appendChild(button);
  button.addEventListener('click', () => handleOpen?.());
  bindTooltip(button, {content: formatMessage({defaultMessage: 'Emote Menu'})});
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
  button.classList.add(iconButtonStyles.button);
  buttonContainer.appendChild(button);
  button.addEventListener('click', () => handleOpen?.());
}

function unloadEmoteMenu() {
  shadowDOM.unmount(ShadowDOMComponentIds.EMOTE_MENU);
}

function loadEmoteMenu(onMount, onError) {
  if (shadowDOM.isMounted(ShadowDOMComponentIds.EMOTE_MENU)) {
    onMount();
  }

  let placement = 'top-end';

  if (!isStandaloneWindow()) {
    const chatLayoutPosition = settings.get(SettingIds.CHAT_LAYOUT);
    placement = chatLayoutPosition === ChatLayoutTypes.RIGHT ? 'top-end' : 'top-start';
  }

  shadowDOM.mount(
    ShadowDOMComponentIds.EMOTE_MENU,
    <SafeEmoteMenu
      onError={onError}
      onMount={onMount}
      setHandleOpen={setHandleOpen}
      appendToChat={appendToChat}
      boundingQuerySelector={CHAT_TEXT_AREA}
      emoteMenuToggleButtonSelector={EMOTE_MENU_TOGGLE_BUTTON_SELECTOR}
      offsetOptions={{mainAxis: 8}}
      placement={placement}
    />
  );
}

class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_INPUT_BUTTONS_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.load();
    });
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.load());
    settings.on(`changed.${SettingIds.CHAT_LAYOUT}`, () => this.load());
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
