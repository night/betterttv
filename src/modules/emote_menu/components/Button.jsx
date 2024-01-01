/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import Whisper from 'rsuite/Whisper';
import LogoIcon from '../../../common/components/LogoIcon.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import {EmoteMenuTips} from '../../../constants.js';
import keyCodes from '../../../utils/keycodes.js';
import {isMac} from '../../../utils/window.js';
import styles from './Button.module.css';
import EmoteMenuPopover from './EmoteMenuPopover.jsx';
import {markTipAsSeen} from './Tip.jsx';

export default function Button({
  isLegacy = false,
  appendToChat,
  className,
  boundingQuerySelector,
  containerQuerySelector,
}) {
  const [loaded, setLoaded] = useState(false);
  const [whisperOpen, setWhisperOpen] = useState(false);
  const whisperRef = useRef(null);

  const toggleWhisper = useCallback(whisperOpen ? () => whisperRef.current.close() : () => whisperRef.current.open(), [
    whisperOpen,
    whisperRef,
  ]);

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

      toggleWhisper();
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleWhisper]);

  return (
    <Whisper
      ref={whisperRef}
      onOpen={() => setWhisperOpen(true)}
      onClose={() => setWhisperOpen(false)}
      container={
        containerQuerySelector != null ? () => document.querySelector(containerQuerySelector) ?? undefined : undefined
      }
      trigger="click"
      placement={null} // this throws a warning but is necessary to stop rsuite from auto-respositioning
      speaker={
        <EmoteMenuPopover
          toggleWhisper={toggleWhisper}
          appendToChat={appendToChat}
          boundingQuerySelector={boundingQuerySelector}
        />
      }>
      {isLegacy ? (
        <button type="button" className={classNames(styles.legacyButton, className)} />
      ) : (
        <button type="button" className={classNames(styles.button, className)}>
          <LogoIcon />
        </button>
      )}
    </Whisper>
  );
}
