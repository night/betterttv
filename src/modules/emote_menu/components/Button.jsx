import React, {useRef} from 'react';
import Whisper from 'rsuite/lib/Whisper/index.js';
import Popover from 'rsuite/lib/Popover/index.js';
import classNames from 'classnames';
import parse from 'html-react-parser';
import EmoteMenu from './Menu.jsx';
import styles from '../styles/button.module.css';

const widthStyle = window.location.pathname.endsWith('/chat') ? styles.smallPopover : styles.bigPopover;

export default function Button({appendToChat, button}) {
  const triggerRef = useRef(null);

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
      {parse(button)}
    </Whisper>
  );
}
