import React from 'react';
import {createRoot} from 'react-dom/client';
import {SettingIds} from '../../../constants.js';
import settings from '../../../settings.js';
import domObserver from '../../../observers/dom.js';
import CommandRow from '../components/CommandRow.jsx';
import AutocompleteWhisper from '../../../common/components/autocomplete/AutocompleteWhisper.jsx';
import styles from './CommandAutocomplete.module.css';
import commandStore from '../../../common/stores/command-store.js';

let mountedRoot;

const CHAT_TEXT_AREA = '.yt-live-chat-text-input-field-renderer[contenteditable]';
const AUTOCOMPLETE_CONTAINER_SELECTOR = 'div[data-a-target="bttv-command-autocomplete-matches-container"]';

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

function getChatInputPartialCommand() {
  const {anchorNode, anchorOffset} = document.getSelection();
  if (anchorNode?.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const {value, start} = findFocusedWord(anchorNode.data, anchorOffset);
  if (value == null || !/^(!(.*[a-zA-Z0-9]){2,})/.test(value) || start !== 0) {
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
    let commandAutocompleteMatchesContainer = document.querySelector(AUTOCOMPLETE_CONTAINER_SELECTOR);
    const commandAutocomplete = settings.get(SettingIds.EMOTE_AUTOCOMPLETE);
    const element = document.querySelector(CHAT_TEXT_AREA);

    if (commandAutocomplete && element != null) {
      if (commandAutocompleteMatchesContainer == null) {
        commandAutocompleteMatchesContainer = document.createElement('div');
        commandAutocompleteMatchesContainer.setAttribute(
          'data-a-target',
          'bttv-command-autocomplete-matches-container'
        );

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
          onComplete={this.replaceChatInputPartialCommand}
          getChatInputPartialInput={this.getChatInputPartialCommand}
          computeMatches={(partialInput) => {
            const searchedCommands = commandStore.search(partialInput);
            return searchedCommands.map(({item}) => item);
          }}
          renderRow={({index, item, handleAutocomplete, active, setSelected}) => (
            <CommandRow
              key={item._id}
              index={index}
              command={item}
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

  replaceChatInputPartialCommand(command) {
    // console.log(command);
  }

  getChatInputPartialCommand() {
    const partialInput = getChatInputPartialCommand();
    toggleNativeAutocomplete(partialInput);
    return partialInput;
  }
}
