import React from 'react';
import ReactDOM from 'react-dom';
import settings from '../../../settings.js';
import {EmoteProviders, SettingIds} from '../../../constants.js';
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

function createYoutubeInputEmoji(emote) {
  const img = document.createElement('img');
  img.className = 'emoji yt-formatted-string style-scope yt-live-chat-text-input-field-renderer';
  img.src = emote.images['1x'];
  img.alt = emote.code;
  img.setAttribute('data-emoji-id', emote.id.replace(`${EmoteProviders.YOUTUBE}-`, ''));
  return img;
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
          onClick={() => {
            togglePopover();
            this.focusChat();
          }}
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

  focusChat() {
    const element = document.querySelector(INPUT_BOX_SELECTOR);
    element.focus();
  }

  appendToChat(emote) {
    const element = document.querySelector(INPUT_BOX_SELECTOR);

    if (!emote.id.startsWith(EmoteProviders.YOUTUBE)) {
      element.innerHTML += `${emote.code} `;
    } else {
      const node = createYoutubeInputEmoji(emote);
      element.appendChild(node);
    }

    const range = document.createRange();
    const sel = window.getSelection();

    range.setStart(element.lastChild, element.innerHTML.length);
    range.collapse(true);

    sel.removeAllRanges();
    sel.addRange(range);

    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.focus();
  }
}
