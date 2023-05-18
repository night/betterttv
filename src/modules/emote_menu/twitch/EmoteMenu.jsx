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

const CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR = '.chat-input div[data-test-selector="chat-input-buttons-container"]';
const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';
const BTTV_BUTTON_CONTAINER_ID = 'bttv-emote-menu-button-container';
const BTTV_BUTTON_CONTAINER_SELECTOR = `#${BTTV_BUTTON_CONTAINER_ID}`;

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
    domObserver.on(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.loadButton();
    });
    watcher.on('load.chat', () => this.loadButton());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.loadButton());
  }

  loadButton() {
    if (getCurrentUser() == null) {
      return;
    }

    const emoteMenuValue = settings.get(SettingIds.EMOTE_MENU);
    if (emoteMenuValue !== EmoteMenuTypes.NONE) {
      if (isMounted && mountedRoot != null) {
        mountedRoot.unmount();
        isMounted = false;
        const currentContainer = document.querySelector(BTTV_BUTTON_CONTAINER_SELECTOR);
        if (currentContainer != null) {
          currentContainer.remove();
        }
      }

      const container = document.createElement('div');
      container.setAttribute('id', BTTV_BUTTON_CONTAINER_ID);

      if (emoteMenuValue === EmoteMenuTypes.ENABLED) {
        const nativeEmotePickerButtonContainer = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR)?.parentElement;
        if (nativeEmotePickerButtonContainer == null) {
          return;
        }
        const chatInputIcons = nativeEmotePickerButtonContainer.parentElement;
        if (chatInputIcons == null) {
          return;
        }
        chatInputIcons.classList.add(styles.chatInputIcon);
        chatInputIcons.appendChild(container);
      } else {
        const chatSettingsButtonContainer = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);
        if (chatSettingsButtonContainer == null) {
          return;
        }
        const rightContainer = chatSettingsButtonContainer.lastChild;
        rightContainer.insertBefore(container, rightContainer.lastChild);
      }

      mountedRoot = createRoot(container);
      mountedRoot.render(
        <SafeEmoteMenuButton
          onError={() => this.show(EmoteMenuTypes.NONE)}
          onMount={() => {
            this.show(emoteMenuValue);
            isMounted = true;
          }}
          appendToChat={this.appendToChat}
          className={styles.button}
          boundingQuerySelector={CHAT_TEXT_AREA}
        />
      );
    }

    if (isMounted) {
      this.show(emoteMenuValue);
    }
  }

  show(emoteMenuValue) {
    const container = document.querySelector(BTTV_BUTTON_CONTAINER_SELECTOR);
    container.classList.toggle(styles.hideEmoteMenuButton, emoteMenuValue === EmoteMenuTypes.NONE);

    const emotePickerButtonContainer = document.querySelector(EMOTE_PICKER_BUTTON_SELECTOR)?.parentElement;
    if (emotePickerButtonContainer == null) {
      return;
    }
    emotePickerButtonContainer.classList.toggle(
      styles.hideDefaultEmoteMenuButton,
      emoteMenuValue === EmoteMenuTypes.ENABLED
    );
  }

  appendToChat({code: text}, shouldFocus = true) {
    let prefixText = twitch.getChatInputValue();

    // suffix the prefix with a space if it needs one
    if (prefixText.length > 0 && !prefixText.endsWith(' ')) {
      prefixText += ' ';
    }

    twitch.setChatInputValue(`${prefixText}${text} `, shouldFocus);
  }
}
