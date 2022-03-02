import {useEffect, useState} from 'react';

function handleChatInput(focusedWord) {
  if (focusedWord == null) {
    return '';
  }

  return focusedWord.replace(/\s|:/g, '');
}

export default function useChatInputPartialEmote(chatInputElement, getChatInputPartialEmote) {
  const [partialInput, setPartialInput] = useState('');

  useEffect(() => {
    function inputCallback(event) {
      const value = getChatInputPartialEmote();

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
  }, [getChatInputPartialEmote, chatInputElement]);

  return [partialInput, setPartialInput];
}
