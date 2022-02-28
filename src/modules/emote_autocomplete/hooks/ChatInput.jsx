import {useEffect, useState} from 'react';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';

function handleChatInput(focusedWord) {
  if (focusedWord == null) {
    return [];
  }

  const strippedFocusedWord = focusedWord.replace(/\s|:/g, '');
  const foundEmotes = emoteMenuViewStore.search(strippedFocusedWord);

  return foundEmotes.map((emote) => emote.item);
}

export default function useChatInput(chatInputElement, getAutocomplete) {
  const [emotes, setEmotes] = useState([]);

  useEffect(() => {
    function inputCallback(event) {
      const value = getAutocomplete();

      if (value == null) {
        return;
      }

      setEmotes(handleChatInput(value));
      event.stopPropagation();
    }

    function dirtyCallback() {
      if (!emoteMenuViewStore.isLoaded()) {
        emoteMenuViewStore.once('updated', () => {
          setEmotes(handleChatInput(getAutocomplete()));
        });
      }
    }

    const cleanup = emoteMenuViewStore.on('dirty', dirtyCallback);
    chatInputElement.addEventListener('input', inputCallback);

    return () => {
      cleanup();
      chatInputElement.removeEventListener('input', chatInputElement);
    };
  }, [getAutocomplete, chatInputElement]);

  return [emotes, setEmotes];
}
