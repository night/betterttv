import {useEffect, useState} from 'react';
import emoteSearchStore from '../../../common/stores/emote-menu-view-store.js';
import twitch from '../../../utils/twitch.js';

const DEFAULT_EMOTES = [];

function findFocusedWord(parts = [], selectionStart = 0) {
  let total = 0;

  for (const part of parts) {
    if (selectionStart > total && selectionStart <= total + part.length) {
      return part;
    }
    total += part.length + 1;
  }

  return null;
}

function handleChatInput() {
  const value = twitch.getChatInputValue();
  const selectionStart = twitch.getChatInputSelection();

  const parts = value.split(' ');
  const focusedWord = findFocusedWord(parts, selectionStart);
  const matches = value.match(/(?:^|\s):[^(?::|\s)]{1,}/g);

  if (matches == null || focusedWord == null) {
    return DEFAULT_EMOTES;
  }

  const strippedFocusedWord = focusedWord.replace(/\s|:/g, '');
  const strippedMatches = matches.map((match) => match.replace(/\s|:/g, ''));

  if (strippedMatches.includes(strippedFocusedWord)) {
    const foundEmotes = emoteSearchStore.search(strippedFocusedWord);
    return foundEmotes.map((emote) => emote.item);
  }

  return DEFAULT_EMOTES;
}

export default function useChatInput(chatInputElement) {
  const [emotes, setEmotes] = useState(DEFAULT_EMOTES);

  useEffect(() => {
    function keydownCallback() {
      const searchedEmotes = handleChatInput();
      setEmotes(searchedEmotes);
    }

    chatInputElement.addEventListener('keydown', keydownCallback);

    return () => {
      chatInputElement.removeEventListener('keydown', keydownCallback);
    };
  }, []);

  return [emotes, setEmotes];
}
