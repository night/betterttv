import React from 'react';
import ReactDOM from 'react-dom';
import {getCurrentUser} from '../../../utils/user.js';
import EmoteWhisper from '../components/EmoteWhisper.jsx';
import domObserver from '../../../observers/dom.js';
import {isEmoteAutocompletable} from '../../../utils/autocomplete.js';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import twitch from '../../../utils/twitch.js';
import styles from './EmoteAutocomplete.module.css';

let mountedNode;
let listener;

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';
const TWITCH_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-test-selector="autocomplete-matches-container"]';

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    this.unloadTwitchAutocomplete();

    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => {
      this.load();
      this.unloadTwitchAutocomplete();
    });
  }

  load() {
    if (getCurrentUser() == null) {
      return;
    }

    const element = document.querySelector(CHAT_TEXT_AREA);
    const emoteAutcompletContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);
    const emoteAutocomplete = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);

    if (emoteAutcompletContainer == null && emoteAutocomplete) {
      const whisperContainer = document.createElement('div');
      whisperContainer.setAttribute('data-a-target', 'bttv-autocomplete-matches-container');
      document.body.appendChild(whisperContainer);

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <EmoteWhisper
          boundingQuerySelector={CHAT_TEXT_AREA}
          chatInputElement={element}
          autocomplete={this.autocomplete}
        />,
        whisperContainer
      );

      mountedNode = whisperContainer;
    }

    this.show();
  }

  show() {
    const autocompleteContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);
    const emoteMenuEnabled = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);

    if (autocompleteContainer == null) {
      return;
    }

    autocompleteContainer.classList.toggle(styles.hideEmoteAutocomplete, !emoteMenuEnabled);
  }

  autocomplete(string) {
    const currentValue = twitch.getChatInputValue();
    const parts = currentValue.split(' ');
    parts.pop();
    parts.push(string);
    twitch.setChatInputValue(parts.join(' '), true);
  }

  unloadTwitchAutocomplete() {
    if (!settings.get(SettingIds.EMOTE_AUTOCOMPLETE)) {
      if (listener != null) {
        listener();
        listener = null;
      }

      return;
    }

    listener = domObserver.on(TWITCH_AUTOCOMPLETE_CONTAINER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      if (isEmoteAutocompletable()) {
        node.remove();
      }
    });
  }
}
