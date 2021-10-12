/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useState, useRef, useEffect} from 'react';
import classNames from 'classnames';
import Whisper from 'rsuite/lib/Whisper/index.js';
import EmoteMenuPopover from './EmoteMenuPopover.jsx';
import {markTipAsSeen} from './Tip.jsx';
import {EmoteMenuTips} from '../../../constants.js';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import keyCodes from '../../../utils/keycodes.js';
import {isMac} from '../../../utils/window.js';
import styles from './LegacyButton.module.css';

export default function LegacyButton({appendToChat, setPopoverOpen, onClick, className, boundingQuerySelector}) {
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
      const isPressed =
        (event.altKey && event.key === keyCodes.E) || (isMac() && event.ctrlKey && event.key === keyCodes.E);
      if (!isPressed) {
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
      speaker={
        <EmoteMenuPopover
          triggerRef={triggerRef}
          appendToChat={appendToChat}
          boundingQuerySelector={boundingQuerySelector}
        />
      }
      triggerRef={triggerRef}>
      <button type="button" className={classNames(styles.button, className)} />
    </Whisper>
  );
}
