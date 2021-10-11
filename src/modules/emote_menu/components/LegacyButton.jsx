/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useState, useRef, useEffect} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import EmoteMenuPopover from './EmoteMenuPopover.jsx';
import {markTipAsSeen} from './Tip.jsx';
import {EmoteMenuTips} from '../../../constants.js';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import keyCodes from '../../../utils/keycodes.js';
import styles from './LegacyButton.module.css';

export default function LegacyButton({appendToChat, setPopoverOpen, onClick, classname}) {
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

  useEffect(() => {
    function handleKeyDown(event) {
      if (!event.altKey || event.code !== keyCodes.E) {
        return;
      }

      event.preventDefault();

      markTipAsSeen(EmoteMenuTips.EMOTE_MENU_HOTKEY);
      onClick();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Whisper
      trigger="active"
      placement="auto"
      onClick={onClick}
      speaker={<EmoteMenuPopover triggerRef={triggerRef} appendToChat={appendToChat} className={classname} />}
      triggerRef={triggerRef}>
      <button type="button" className={styles.button} />
    </Whisper>
  );
}
