/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {useState, useRef, useEffect} from 'react';
import classNames from 'classnames';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './Menu.jsx';
import {hasTipToDisplay} from './Tip.jsx';
import emoteStore from '../stores/index.js';
import styles from '../styles/legacy-button.module.css';

export default function LegacyButton({appendToChat, setPopoverOpen, onClick}) {
  const triggerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [hasTip, setTip] = useState(false);

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

  function handleSetTip(show) {
    if ((show && hasTip) || (!show && !hasTip)) {
      return;
    }

    setTip(show);
  }

  useEffect(() => {
    // TODO: we should not have logic like this in the parent
    // instead, we should have the popout position be computed on open to the top of the chat input
    // and then automatically reposition when changes like this (or the chat input grows) happen
    const popoverElement = document.getElementsByClassName(styles.popover)[0];
    if (popoverElement != null) {
      const currentTop = parseInt(popoverElement.style.top, 10);
      const newTop = hasTip ? currentTop - 26 : currentTop + 26;
      popoverElement.style.top = `${newTop}px`;
    }
  }, [hasTip]);

  return (
    <Whisper
      trigger="active"
      placement="auto"
      onClick={onClick}
      speaker={
        <Popover className={classNames(styles.popover, hasTip ? styles.withTip : null)} full>
          <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} onSetTip={(show) => handleSetTip(show)} />
        </Popover>
      }
      triggerRef={triggerRef}
    >
      <button type="button" className={styles.button} />
    </Whisper>
  );
}
