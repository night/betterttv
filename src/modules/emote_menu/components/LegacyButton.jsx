/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useState, useRef, useEffect} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './Menu.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/legacy-button.module.css';

export default function LegacyButton({appendToChat, setPopoverOpen, onClick}) {
  const triggerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const callback = () => {
      setPopoverOpen(triggerRef);
      setLoaded(true);
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
      placement="auto"
      onClick={onClick}
      speaker={
        <Popover className={styles.popover} full>
          <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} />
        </Popover>
      }
      triggerRef={triggerRef}
    >
      <button type="button" className={styles.button} />
    </Whisper>
  );
}
