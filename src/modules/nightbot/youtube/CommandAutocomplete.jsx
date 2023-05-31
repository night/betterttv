import React from 'react';
import {createRoot} from 'react-dom/client';
import {EmoteProviders, SettingIds} from '../../../constants.js';
import settings from '../../../settings.js';
import {createYoutubeEmojiNode} from '../../../utils/youtube.js';
import domObserver from '../../../observers/dom.js';
import EmoteRow from '../components/EmoteRow.jsx';
import AutocompleteWhisper from '../../../common/components/autocomplete/AutocompleteWhisper.jsx';
import styles from './CommandAutocomplete.module.css';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';

let mountedRoot;

const CHAT_TEXT_AREA = '.yt-live-chat-text-input-field-renderer[contenteditable]';
const EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-autocomplete-matches-container"]';

function findFocusedWord(value, selectionStart = 0) {
  const subString = value.substring(0, selectionStart);
  const focusedWords = subString.split(/\s+/);
  const focusedWord = focusedWords[focusedWords.length - 1];

  return {
    value: focusedWord,
    start: subString.length - focusedWord.length,
    end: selectionStart,
  };
}

function getChatInputPartialEmote() {
  const {anchorNode, anchorOffset} = document.getSelection();
  if (anchorNode?.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const {value} = findFocusedWord(anchorNode.data, anchorOffset);
  if (value == null || !/^(:(.*[a-zA-Z0-9]){2,})/.test(value) || value.endsWith(':')) {
    return null;
  }

  return value;
}

function toggleNativeAutocomplete(partialInput) {
  const nativeAutocomplete = document.querySelector('yt-live-chat-text-input-field-renderer > tp-yt-iron-dropdown');

  if (nativeAutocomplete == null) {
    return;
  }

  nativeAutocomplete.classList.toggle(styles.hideNativeAutocomplete, partialInput != null);
}

export default class CommandAutocomplete {
  constructor() {
    domObserver.on('.yt-live-chat-text-input-field-renderer', () => this.load());
    settings.on(`changed.${SettingIds.EMOTE_AUTOCOMPLETE}`, () => this.load());
  }

  load() {
    let commandAutocompleteMatchesContainer = document.querySelector(EMOTE_AUTOCOMPLETE_CONTAINER_SELECTOR);
    const commandAutocomplete = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);
    const element = document.querySelector(CHAT_TEXT_AREA);

    if (commandAutocomplete && element != null) {
      if (commandAutocompleteMatchesContainer == null) {
        commandAutocompleteMatchesContainer = document.createElement('div');
        commandAutocompleteMatchesContainer.setAttribute('data-a-target', 'bttv-autocomplete-matches-container');

        const chatElement = document.querySelector('#chat');
        if (chatElement != null) {
          chatElement.appendChild(commandAutocompleteMatchesContainer);
        }
      }

      if (mountedRoot != null) {
        mountedRoot.unmount();
      }

      mountedRoot = createRoot(commandAutocompleteMatchesContainer);
      mountedRoot.render(
        <AutocompleteWhisper
          boundingQuerySelector={CHAT_TEXT_AREA}
          chatInputElement={element}
          onComplete={this.replaceChatInputPartialEmote}
          getChatInputPartialInput={this.getChatInputPartialEmote}
          computeMatches={(partialInput) => {
            const searchedEmotes = emoteMenuViewStore.search(partialInput);
            return searchedEmotes.map(({item}) => item);
          }}
          renderRow={({key, index, item, handleAutocomplete, active, setSelected}) => (
            <EmoteRow
              key={key}
              index={index}
              emote={item}
              handleAutocomplete={handleAutocomplete}
              active={active}
              setSelected={setSelected}
            />
          )}
        />
      );
    }

    if (!commandAutocomplete && commandAutocompleteMatchesContainer != null) {
      mountedRoot?.unmount();
    }
  }

  replaceChatInputPartialEmote(emote) {
    const {anchorNode, anchorOffset} = document.getSelection();

    if (anchorNode?.nodeType !== Node.TEXT_NODE) {
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

  getChatInputPartialEmote() {
    const partialInput = getChatInputPartialEmote();
    toggleNativeAutocomplete(partialInput);
    return partialInput;
  }
}
