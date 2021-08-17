import React, {useEffect, useRef} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import classNames from 'classnames';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';
import emoteStore from '../stores/index.js';

const widthStyle = window.location.pathname.endsWith('/chat') ? styles.smallPopover : styles.bigPopover;

export default function Button({appendToChat, setHandleOpen}) {
  const triggerRef = useRef(null);

  useEffect(() => {
    emoteStore.once('updated', () => {
      setHandleOpen(() => triggerRef.current.open());
    });
  }, []);

  return (
    <Whisper
      trigger="click"
      placement="topEnd"
      speaker={
        <Popover className={classNames(styles.popover, widthStyle)} full>
          <EmoteMenu triggerRef={triggerRef} appendToChat={appendToChat} />
        </Popover>
      }
      triggerRef={triggerRef}>
      <span />
    </Whisper>
  );
}
