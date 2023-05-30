import {useEffect, useState} from 'react';

export default function useChatInputPartialInput(chatInputElement, getChatInputPartialInput) {
  const [partialInput, setPartialInput] = useState('');

  useEffect(() => {
    function handleInput(event) {
      const value = getChatInputPartialInput();

      if (value == null) {
        setPartialInput('');
        return;
      }

      setPartialInput(value);
      event.stopPropagation();
    }

    chatInputElement?.addEventListener('input', handleInput);

    return () => {
      chatInputElement?.removeEventListener('input', handleInput);
    };
  }, [getChatInputPartialInput, chatInputElement]);

  return partialInput;
}
