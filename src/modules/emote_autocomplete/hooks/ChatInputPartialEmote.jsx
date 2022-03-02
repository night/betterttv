import {useEffect, useState} from 'react';

function handleChatInput(focusedWord) {
  if (focusedWord == null) {
    return '';
  }

  return focusedWord.replace(/\s|:/g, '');
}

export default function useChatInputPartialEmote(chatInputElement, getAutocomplete) {
  const [partialInput, setPartialInput] = useState('');

  useEffect(() => {
    function inputCallback(event) {
      const value = getAutocomplete();

      if (value == null) {
        return;
      }

      setPartialInput(handleChatInput(value));
      event.stopPropagation();
    }

    chatInputElement.addEventListener('input', inputCallback);

    return () => {
      chatInputElement.removeEventListener('input', chatInputElement);
    };
  }, [getAutocomplete, chatInputElement]);

  return [partialInput, setPartialInput];
}
