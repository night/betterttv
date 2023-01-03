import {useEffect, useState} from 'react';

export default function useChatInputPartialEmote(chatInputElement, getChatInputPartialEmote) {
  const [partialInput, setPartialInput] = useState('');

  useEffect(() => {
    function handleInput(event) {
      const value = getChatInputPartialEmote();

      if (value == null) {
        setPartialInput('');
        return;
      }

      setPartialInput(value);
      event.stopPropagation();
    }

    chatInputElement.addEventListener('input', handleInput);

    return () => {
      chatInputElement.removeEventListener('input', handleInput);
    };
  }, [getChatInputPartialEmote, chatInputElement]);

  return partialInput;
}
