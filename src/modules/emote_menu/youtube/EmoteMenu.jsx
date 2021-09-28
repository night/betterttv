import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {emotesCategoryIds, SettingIds} from '../../../constants.js';
import SafeEmoteMenuButton from '../components/SafeEmoteMenu.jsx';
import styles from './EmoteMenu.module.css';

const CHAT_BUTTONS_CONTAINER_SELECTOR = 'yt-live-chat-message-input-renderer > #container > #buttons';
const INPUT_BOX_SELECTOR = 'yt-live-chat-text-input-field-renderer > #input';
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
      chatButtonsContainer.prepend(buttonContainer);

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

  appendToChat(emote, shouldFocus = true) {
    const element = document.querySelector(INPUT_BOX_SELECTOR);
    let text = emote.code;

    if (!emote.id.startsWith(emotesCategoryIds.YOUTUBE)) {
      const currentValue = element.textContent;
      text = `${currentValue} ${text}`;
      element.textContent = text;
    } else {
      const img = document.createElement('img');
      img.className = 'emoji yt-formatted-string style-scope yt-live-chat-text-input-field-renderer';
      img.src = emote.images['1x'];
      img.alt = emote.code;
      img.setAttribute('data-emoji-id', emote.id.replace(`${emotesCategoryIds.YOUTUBE}-`, ''));
      element.appendChild(img);
    }

    element.dispatchEvent(new Event('input', {bubbles: true}));

    if (shouldFocus) {
      element.focus();
    }
  }
}
