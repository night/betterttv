import React from 'react';
import ReactDOM from 'react-dom';
import {getCurrentUser} from '../../../utils/user.js';
import EmoteWhisper from '../components/EmoteWhisper.jsx';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';
import twitch, {SelectionTypes} from '../../../utils/twitch.js';
import dom from '../../../observers/dom.js';

let mountedNode;

const CHAT_TEXT_AREA = 'textarea[data-a-target="chat-input"], div[data-test-selector="chat-input"]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';
const PARTIAL_EMOTE_REGEX = /:([a-z0-9-_.:]+?)(:|$)/i;

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    dom.on(CHAT_TEXT_AREA, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      this.load();
    });
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

      if (element == null) {
        return;
      }

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
          onComplete={this.replaceChatInputPartialEmote}
          getChatInputPartialEmote={this.getChatInputPartialEmote}
        />,
        whisperContainer
      );

      mountedNode = whisperContainer;
    }

    if (!emoteAutocomplete && emoteAutcompleteContainer != null) {
      ReactDOM.unmountComponentAtNode(mountedNode);
    }
  }

  isActive() {
    return settings.get(SettingIds.EMOTE_AUTOCOMPLETE) && this.getChatInputPartialEmote() != null;
  }

  replaceChatInputPartialEmote({code}) {
    const currentValue = twitch.getChatInputValue();
    const newValue = currentValue.replace(PARTIAL_EMOTE_REGEX, code);

    twitch.setChatInputValue(newValue, true);
  }

  getChatInputPartialEmote() {
    const value = twitch.getChatInputValue();
    const selection = twitch.getChatInputSelection();

    if (selection !== SelectionTypes.END || value.endsWith(' ')) {
      return null;
    }

    const lastWord = value.split(/\s+/).at(-1);
    const partialEmote = lastWord.match(PARTIAL_EMOTE_REGEX);

    if (partialEmote == null) {
      return null;
    }

    const [match, partial, isComplete] = partialEmote;
    if (isComplete.length > 0 || !match.startsWith(':')) {
      return null;
    }

    return partial;
  }
}
