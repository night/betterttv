import {useEffect, useState} from 'react';

export default function useChatInputPartialEmote(chatInputElement, getChatInputPartialEmote) {
  const [partialInput, setPartialInput] = useState('');

  useEffect(() => {
    function inputCallback(event) {
      const value = getChatInputPartialEmote();

      if (value == null) {
        setPartialInput('');
        return;
      }

      setPartialInput(value);
      event.stopPropagation();
    }

    chatInputElement.addEventListener('input', inputCallback);

    return () => {
      chatInputElement.removeEventListener('input', inputCallback);
    };
  }, [getChatInputPartialEmote, chatInputElement]);

  return partialInput;
}
