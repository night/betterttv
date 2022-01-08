/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useState, useEffect, useRef} from 'react';
import classNames from 'classnames';
import Whisper from 'rsuite/Whisper';
import EmoteMenuPopover from './EmoteMenuPopover.jsx';
import {markTipAsSeen} from './Tip.jsx';
import {EmoteMenuTips} from '../../../constants.js';
import emoteMenuViewStore from '../stores/emote-menu-view-store.js';
import keyCodes from '../../../utils/keycodes.js';
import {isMac} from '../../../utils/window.js';
import styles from './LegacyButton.module.css';

export default function LegacyButton({appendToChat, className, boundingQuerySelector}) {
  const [loaded, setLoaded] = useState(false);
  const whisperRef = useRef(null);

  useEffect(() => {
    const callback = () => {
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

      // note v5 removes whisper open state in reference (implement toggle with hooks?)
      whisperRef.current.open();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Whisper
      ref={whisperRef}
      trigger="click"
      placement={false} // this throws a warning but is nessecary to stop rsuite from auto-respositioning
      speaker={
        <EmoteMenuPopover
          whisperRef={whisperRef}
          appendToChat={appendToChat}
          boundingQuerySelector={boundingQuerySelector}
        />
      }>
      <button type="button" className={classNames(styles.button, className)} />
    </Whisper>
  );
}
