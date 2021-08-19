import React, {useEffect, useRef, useState} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import parse from 'html-react-parser';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';
import emoteStore from '../stores/index.js';

export default function Button({appendToChat, button}) {
  const triggerRef = useRef(null);
  const [trigger, setTrigger] = useState('none');

  useEffect(() => {
    if (emoteStore.isLoaded()) {
      setTrigger('click');
      return;
    }

    emoteStore.once('loaded', () => {
      setTrigger('click');
    });
  }, []);

  return (
    <Whisper
      trigger={trigger}
      placement="topEnd"
      speaker={
        <Popover className={styles.popover} full>
          <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} />
        </Popover>
      }
      triggerRef={triggerRef}>
      {parse(button)}
    </Whisper>
  );
}
