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
const EMOTE_PICKER_BUTTON_SELECTOR = 'button[data-a-target="emote-picker-button"]';

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

      this.loadLegacyButton();
    });
    watcher.on('load.chat', () => this.loadLegacyButton());
    settings.on(`changed.${SettingIds.EMOTE_MENU}`, () => this.loadLegacyButton());
  }

  loadLegacyButton() {
    if (getCurrentUser() == null) {
      return;
    }

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    const emoteMenuValue = settings.get(SettingIds.EMOTE_MENU);

    if (emoteMenuValue !== EmoteMenuTypes.NONE) {
      const buttonContainer = document.createElement('div');
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');

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
        chatInputIcons.appendChild(buttonContainer);
      } else {
        const container = document.querySelector(CHAT_SETTINGS_BUTTON_CONTAINER_SELECTOR);
        if (container == null) {
          return;
        }
        const rightContainer = container.lastChild;
        rightContainer.insertBefore(buttonContainer, rightContainer.lastChild);
      }

      if (mountedRoot != null) {
        mountedRoot.unmount();
        isMounted = false;
        if (legacyContainer != null) {
          legacyContainer.remove();
        }
      }

      mountedRoot = createRoot(buttonContainer);
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
    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);
    legacyContainer.classList.toggle(styles.hideEmoteMenuButton, emoteMenuValue === EmoteMenuTypes.NONE);

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
