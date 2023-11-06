import React from 'react';
import {createRoot} from 'react-dom/client';
import {EmoteMenuTypes, EmoteProviders, SettingIds} from '../../../constants.js';
import domObserver from '../../../observers/dom.js';
import settings from '../../../settings.js';
import {getCurrentUser} from '../../../utils/user.js';
import {createYoutubeEmojiNode} from '../../../utils/youtube.js';
import watcher from '../../../watcher.js';
import EmoteMenuButton from '../components/Button.jsx';
import styles from './EmoteMenu.module.css';

const CHAT_TEXT_AREA = 'div#input[contenteditable]';

const BTTV_EMOTE_PICKER_BUTTON_CONTAINER_CLASS = 'bttv-emote-picker-button-container';
const CHAT_BUTTON_CONTAINER_SELECTOR = '#picker-buttons';
const NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR = '.yt-live-chat-icon-toggle-button-renderer';

class SafeEmoteMenuButton extends React.Component {
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
    return <EmoteMenuButton {...this.props} />;
  }
}

let mountedRoot;
let isMounted = false;

export default class EmoteMenuModule {
  constructor() {
    domObserver.on(CHAT_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadButton();
    });
    watcher.on('load.youtube', () => this.loadButton());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.loadButton());
  }

  loadButton() {
    if (getCurrentUser() == null) {
      return;
    }

    const container = document.querySelector(`.${BTTV_EMOTE_PICKER_BUTTON_CONTAINER_CLASS}`);
    const emoteMenuValue = settings.get(SettingIds.EMOTE_MENU);
    const emoteMenuEnabled = emoteMenuValue !== EmoteMenuTypes.NONE;

    // TODO: take into account emote menu setting in the future
    if (container == null && emoteMenuEnabled) {
      const nativeButtonContainer = Array.from(document.querySelectorAll(CHAT_BUTTON_CONTAINER_SELECTOR)).find(
        (node) => !node.parentElement.hasAttribute('hidden')
      );
      if (nativeButtonContainer == null) {
        return;
      }
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add(BTTV_EMOTE_PICKER_BUTTON_CONTAINER_CLASS);
      nativeButtonContainer.insertBefore(buttonContainer, nativeButtonContainer.firstChild);

      if (mountedRoot != null) {
        mountedRoot.unmount();
        isMounted = false;
      }

      mountedRoot = createRoot(buttonContainer);
      mountedRoot.render(
        <SafeEmoteMenuButton
          onError={() => this.show(false)}
          onMount={() => {
            this.show(true);
            isMounted = true;
          }}
          appendToChat={this.appendToChat}
          className={styles.button}
          boundingQuerySelector="#live-chat-message-input"
        />
      );
    }

    if (isMounted) {
      this.show(emoteMenuEnabled);
    }
  }

  show(visible) {
    const nativeContainer = document.querySelector(NATIVE_EMOTE_MENU_BUTTON_CONTAINER_SELECTOR);
    if (nativeContainer != null) {
      nativeContainer.classList.toggle(styles.hideEmoteMenuButton, visible);
    }

    const container = document.querySelector(`.${BTTV_EMOTE_PICKER_BUTTON_CONTAINER_CLASS}`);
    if (container != null) {
      container.classList.toggle(styles.hideEmoteMenuButton, !visible);
    }
  }

  appendToChat(emote, shouldFocus = true) {
    const element = document.querySelector(CHAT_TEXT_AREA);

    // selection state is lost when a user opens the emote menu, so we can only append
    const prefixText = element.textContent.toString();
    let prefixSuffixText =
      prefixText.length > 0 && !prefixText.endsWith(' ') && !prefixText.endsWith('\xa0') ? ' ' : '';
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
}
