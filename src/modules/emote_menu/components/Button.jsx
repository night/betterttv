import React, {useRef} from 'react';
import {faIcons} from '@fortawesome/free-solid-svg-icons/faIcons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';

export default function Button() {
  const triggerRef = useRef(null);

  return (
    <Whisper
      trigger="click"
      placement="topEnd"
      speaker={
        <Popover className={styles.popover} full>
          <EmoteMenu triggerRef={triggerRef} />
        </Popover>
      }
      triggerRef={triggerRef}>
      <button type="button" className={styles.button}>
        <FontAwesomeIcon icon={faIcons} />
      </button>
    </Whisper>
  );
}
