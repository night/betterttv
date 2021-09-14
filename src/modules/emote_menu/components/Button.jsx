/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useEffect, useRef} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';
import emoteStore from '../stores/index.js';

let loaded = false;

export default function Button({appendToChat, setPopoverOpen}) {
  const triggerRef = useRef(null);

  useEffect(() => {
    const callback = () => {
      setPopoverOpen(triggerRef);
      loaded = true;
    };

    if (loaded || emoteStore.isLoaded()) {
      callback();
      return;
    }

    emoteStore.once('updated', callback);
  }, []);

  return (
    <Whisper
      trigger="active"
      placement="topEnd"
      speaker={
        <Popover className={styles.popover} full>
          <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} />
        </Popover>
      }
      triggerRef={triggerRef}
    >
      <div className={styles.placeholder} />
    </Whisper>
  );
}
