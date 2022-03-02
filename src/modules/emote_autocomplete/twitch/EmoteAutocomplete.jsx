import React from 'react';
import ReactDOM from 'react-dom';
import {getCurrentUser} from '../../../utils/user.js';
import EmoteWhisper from '../components/EmoteWhisper.jsx';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import twitch, {SelectionTypes} from '../../../utils/twitch.js';

let mountedNode;

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-a-target="chat-input"]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => this.load());
  }

  load() {
    if (getCurrentUser() == null) {
      return;
    }

    const emoteAutcompleteContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);
    const emoteAutocomplete = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);

    if (emoteAutcompleteContainer == null && emoteAutocomplete) {
      const element = document.querySelector(CHAT_TEXT_AREA);
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
          onComplete={this.autocomplete}
          getChatInputPartialEmote={this.getChatInputPartialEmote}
        />,
        whisperContainer
      );

      mountedNode = whisperContainer;
    }

    this.show();
  }

  show() {
    const emoteMenuEnabled = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);

    if (!emoteMenuEnabled && mountedNode != null) {
      ReactDOM.unmountComponentAtNode(mountedNode);
    }
  }

  isEnabled() {
    return settings.get(SettingIds.EMOTE_AUTOCOMPLETE) && this.getChatInputPartialEmote() != null;
  }

  autocomplete({code}) {
    const currentValue = twitch.getChatInputValue();

    const lastSpaceIndex = currentValue.lastIndexOf(' ');
    const newValue = `${currentValue.substring(0, lastSpaceIndex)} ${code}`;

    twitch.setChatInputValue(newValue, true);
  }

  getChatInputPartialEmote() {
    const value = twitch.getChatInputValue();
    const selection = twitch.getChatInputSelection();

    if (selection !== SelectionTypes.END || value.endsWith(' ')) {
      return null;
    }

    const focusedWord = value.split(/\s+/).at(-1);
    if (focusedWord == null || !/^(:(.*[a-zA-Z0-9]){2,})/.test(focusedWord) || focusedWord.endsWith(':')) {
      return null;
    }

    return focusedWord;
  }
}
