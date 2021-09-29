/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useState, useRef, useEffect} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import EmoteMenuPopover from './EmoteMenuPopover.jsx';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import styles from './LegacyButton.module.css';

export default function LegacyButton({appendToChat, setPopoverOpen, onClick}) {
  const triggerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const callback = () => {
      setPopoverOpen(triggerRef);
      setLoaded(true);
    };

    if (loaded || emoteMenuViewStore.isLoaded()) {
      callback();
      return;
    }

    emoteMenuViewStore.once('updated', callback);
  }, []);

  return (
    <Whisper
      trigger="active"
      placement="auto"
      onClick={onClick}
      speaker={<EmoteMenuPopover triggerRef={triggerRef} appendToChat={appendToChat} />}
      triggerRef={triggerRef}>
      <button type="button" className={styles.button} />
    </Whisper>
  );
}
