import React from 'react';
import ReactDOM from 'react-dom';
import {EmoteProviders, SettingIds} from '../../../constants.js';
import settings from '../../../settings.js';
import {createYoutubeEmojiNode} from '../../../utils/youtube.js';
import EmoteWhisper from '../components/EmoteWhisper.jsx';

let mountedNode;

const CHAT_TEXT_AREA = 'div#input[contenteditable]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';

function findFocusedWord(value, selectionStart = 0) {
  const subString = value.substring(0, selectionStart);
  const focusedWord = subString.split(/\s+/).at(-1);

  return {
    value: focusedWord,
    start: subString.length - focusedWord.length,
    end: selectionStart,
  };
}

export default class EmoteAutocomplete {
  constructor() {
    this.load();
    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => this.load());
  }

  load() {
    const emoteAutcompleteContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);
    const emoteAutocomplete = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);

    if (emoteAutcompleteContainer == null && emoteAutocomplete) {
      const element = document.querySelector(CHAT_TEXT_AREA);
      const whisperContainer = document.createElement('div');
      whisperContainer.setAttribute('data-a-target', 'bttv-autocomplete-matches-container');
      const chatApp = document.querySelector('#chat');

      if (chatApp != null) {
        chatApp.appendChild(whisperContainer);
      }

      if (mountedNode != null) {
        ReactDOM.unmountComponentAtNode(mountedNode);
      }

      ReactDOM.render(
        <EmoteWhisper
          boundingQuerySelector={CHAT_TEXT_AREA}
          chatInputElement={element}
          onComplete={this.autocomplete}
          getAutocomplete={this.getAutocomplete}
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
    return settings.get(SettingIds.EMOTE_AUTOCOMPLETE) && this.getAutocomplete() != null;
  }

  autocomplete(emote) {
    const {anchorNode, anchorOffset} = document.getSelection();

    if (anchorNode.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const {data} = anchorNode;
    const {start, end} = findFocusedWord(data, anchorOffset);

    const prefix = data.substring(0, start);
    const suffix = data.substring(end, data.length);

    const range = document.createRange();
    if (emote.category.provider === EmoteProviders.YOUTUBE) {
      const node = createYoutubeEmojiNode(emote);
      anchorNode.replaceWith(node);

      if (prefix.length > 0) {
        const textNode = document.createTextNode(prefix);
        node.parentElement.insertBefore(textNode, node);
      }

      if (suffix.length > 0) {
        const textNode = document.createTextNode(suffix);
        node.parentElement.insertBefore(textNode, node.nextSibling);
      }

      range.setStartAfter(node);
      range.setEndAfter(node);
    } else {
      anchorNode.textContent = `${prefix}${emote.code}${suffix}`;
      const endSelection = prefix.length + emote.code.length;

      range.setEnd(anchorNode, endSelection);
      range.setStart(anchorNode, endSelection);
    }

    const element = document.querySelector(CHAT_TEXT_AREA);
    element.dispatchEvent(new Event('input', {bubbles: true}));
    element.focus();

    const selection = document.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  getAutocomplete() {
    const {anchorNode, anchorOffset} = document.getSelection();
    if (anchorNode.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    const {value} = findFocusedWord(anchorNode.data, anchorOffset);
    if (value == null || !/^(:(.*[a-zA-Z0-9]){2,})/.test(value) || value.endsWith(':')) {
      return null;
    }

    return value;
  }
}
