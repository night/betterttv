import {useEffect, useState} from 'react';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import {getAutocompletable} from '../../../utils/autocomplete.js';

function handleChatInput() {
  const focusedWord = getAutocompletable();

  if (focusedWord != null) {
    const strippedFocusedWord = focusedWord.replace(/\s|:/g, '');
    const foundEmotes = emoteMenuViewStore.search(strippedFocusedWord);
    return foundEmotes.map((emote) => emote.item);
  }

  return [];
}

export default function useChatInput(setKeyDownCallback) {
  const [emotes, setEmotes] = useState([]);

  function keydownCallback() {
    const updateEmotes = () => setEmotes(handleChatInput());

    if (!emoteMenuViewStore.isLoaded()) {
      emoteMenuViewStore.once('updated', updateEmotes);
    }

    updateEmotes();
  }

  useEffect(() => setKeyDownCallback(keydownCallback), []);

  return [emotes, setEmotes];
}
