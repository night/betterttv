import React, {useEffect, useRef, useState} from 'react';
import {faSmile} from '@fortawesome/free-solid-svg-icons/faSmile';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import classNames from 'classnames';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';
import emoteStore from '../stores/index.js';

const widthStyle = window.location.pathname.endsWith('/chat') ? styles.bigPopover : styles.smallPopover;

export default function Button({appendText}) {
  const triggerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emoteStore.once('updated', () => setLoading(false));
  }, []);

  return (
    <Whisper
      trigger="click"
      placement="topEnd"
      speaker={
        <Popover className={classNames(styles.popover, widthStyle)} full>
          <EmoteMenu triggerRef={triggerRef} appendText={appendText} />
        </Popover>
      }
      triggerRef={triggerRef}>
      <button type="button" className={styles.button} disabled={loading}>
        <FontAwesomeIcon icon={faSmile} />
      </button>
    </Whisper>
  );
}
