import React from 'react';
import {EmoteMenuTypes, EmoteProviders, SettingIds} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import {getCurrentUser} from '../../../utils/user.js';
import {createYoutubeEmojiNode} from '../../../utils/youtube.js';
import watcher from '../../../watcher.js';
import EmoteMenu from '../components/EmoteMenu.jsx';
import styles from './EmoteMenu.module.css';
import shadowDOM from '../../shadow_dom/index.js';

const CHAT_TEXT_AREA = 'div#input[contenteditable]';
const BOUNDING_QUERY_SELECTOR = '#live-chat-message-input';

const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID = 'bttv-emote-picker-button-container';
const CHAT_BUTTON_CONTAINER_SELECTOR = '#picker-buttons';
const NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR = '#emoji-picker-button';
const EMOTE_MENU_COMPONENT_ID = 'emote-menu-component-youtube';

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

function appendToChat(emote, shouldFocus = true) {
  const element = document.querySelector(CHAT_TEXT_AREA);

  // selection state is lost when a user opens the emote menu, so we can only append
  const prefixText = element.textContent.toString();
  let prefixSuffixText = prefixText.length > 0 && !prefixText.endsWith(' ') && !prefixText.endsWith('\xa0') ? ' ' : '';
  const suffixPrefixNode = document.createTextNode('\u00A0');

  let newNode;
  if (emote.category.provider === EmoteProviders.YOUTUBE) {
    newNode = createYoutubeEmojiNode(emote);
  } else {
    newNode = document.createTextNode(`${prefixSuffixText}${emote.code}`);
    prefixSuffixText = '';
  }

  if (prefixSuffixText.length > 0) {
    element.appendChild(document.createTextNode(prefixSuffixText));
  }
  element.appendChild(newNode);
  element.appendChild(suffixPrefixNode);

  element.dispatchEvent(new Event('input', {bubbles: true}));

  if (shouldFocus) {
    const range = document.createRange();
    range.setStartAfter(element.lastChild);
    range.setEndAfter(element.lastChild);

    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    element.focus();
  }
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
      boundingQuerySelector={BOUNDING_QUERY_SELECTOR}
      offsetOptions={{mainAxis: 8, crossAxis: -8}}
    />
  );
}

function loadButton() {
  const container = document.getElementById(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  if (container != null) {
    return;
  }

  const nativeButton = document.querySelector(NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR);
  if (nativeButton == null) {
    return;
  }

  const buttonContainer = document.createElement('div');
  buttonContainer.setAttribute('id', BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  nativeButton.parentElement.insertBefore(buttonContainer, nativeButton);
  nativeButton.classList.add(styles.hideEmoteMenuButton);

  const button = document.createElement('button');
  button.classList.add(styles.button);
  buttonContainer.appendChild(button);
  button.addEventListener('click', () => handleOpen?.());
}

function unloadButton() {
  const container = document.getElementById(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_ID);
  if (container != null) {
    container.remove();
  }

  const nativeButton = document.querySelector(NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR);
  if (nativeButton != null) {
    nativeButton.classList.remove(styles.hideEmoteMenuButton);
  }
}

class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.load();
    });
    watcher.on('load.youtube', () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.load());
  }

  load() {
    if (getCurrentUser() == null) {
      return;
    }

    const emoteMenuValue = settings.get(SettingIds.EMOTE_MENU);
    const emoteMenuEnabled = emoteMenuValue !== EmoteMenuTypes.NONE;

    if (emoteMenuEnabled) {
      loadEmoteMenu(loadButton, unloadButton);
    } else {
      unloadButton();
      unloadEmoteMenu();
    }
  }
}

export default EmoteMenuModule;
