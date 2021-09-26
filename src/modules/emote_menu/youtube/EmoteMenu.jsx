import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import SafeEmoteMenuButton from '../components/SafeEmoteMenu.jsx';
import styles from './EmoteMenu.module.css';

const CHAT_BUTTONS_CONTAINER_SELECTOR = 'yt-live-chat-message-input-renderer > #container > #buttons';
const INPUT_BOX_SELECTOR = 'yt-live-chat-text-input-field-renderer > #input';
const INPUT_BOX_LABEL_SELECTOR = 'yt-live-chat-text-input-field-renderer > #label';
const LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR =
  'div[data-a-target="legacy-bttv-emote-picker-button-container"]';

let togglePopover;
function setPopoverOpen({current}) {
  togglePopover = () => {
    if (current.state.isOverlayShown) {
      current.close();
    } else {
      current.open();
    }
  };
}

export default class EmoteMenuModule {
  constructor() {
    this.load();
    settings.on(`changed.${SettingIds.CLICK_TWITCH_EMOTES}`, () => this.load());
  }

  load() {
    const chatButtonsContainer = document.querySelector(CHAT_BUTTONS_CONTAINER_SELECTOR).firstChild;

    if (chatButtonsContainer == null) {
      return;
    }

    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);

    if (legacyContainer == null) {
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add(styles.emotePickerButtonContainer);
      buttonContainer.setAttribute('data-a-target', 'legacy-bttv-emote-picker-button-container');
      chatButtonsContainer.appendChild(buttonContainer);

      ReactDOM.render(
        <SafeEmoteMenuButton
          classname={styles.popover}
          onError={() => this.show(false)}
          onMount={() => this.show(true)}
          onClick={() => togglePopover()}
          appendToChat={this.appendToChat}
          setPopoverOpen={setPopoverOpen}
        />,
        buttonContainer
      );
    }
  }

  show(visible) {
    const legacyContainer = document.querySelector(LEGACY_BTTV_EMOTE_PICKER_BUTTON_CONTAINER_SELECTOR);

    if (legacyContainer == null) {
      return;
    }

    legacyContainer.classList.toggle(styles.hideEmoteMenuButton, !visible);
  }

  appendToChat(text, shouldFocus = true) {
    const element = document.querySelector(INPUT_BOX_SELECTOR);
    const label = document.querySelector(INPUT_BOX_LABEL_SELECTOR);

    // element.selectionStart returns null?

    const currentValue = element.textContent;
    text = `${currentValue} ${text}`;

    label.textContent = '';
    element.textContent = text;

    if (shouldFocus) {
      element.focus();
    }
  }
}
