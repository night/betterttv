/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useEffect, useRef} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';
import emoteStore from '../stores/index.js';

export default function Button({appendToChat, setPopoverOpen}) {
  const triggerRef = useRef(null);

  useEffect(() => {
    if (emoteStore.isLoaded()) {
      setPopoverOpen(triggerRef);
    }

    emoteStore.once('loaded', () => {
      setPopoverOpen(triggerRef);
    });
  }, []);

  return (
    <Whisper
      enterable
      trigger="focus"
      placement="topEnd"
      speaker={
        <Popover className={styles.popover} full>
          <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} />
        </Popover>
      }
      triggerRef={triggerRef}>
      <span />
    </Whisper>
  );
}
