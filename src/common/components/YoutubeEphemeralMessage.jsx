import React from 'react';
import chat from '../../modules/chat/index.js';
import cdn from '../../utils/cdn.js';
import styles from './YoutubeEphemeralMessage.module.css';

export default function YoutubeEphemeralMessage({message}) {
  const messageRef = React.useRef(null);

  React.useEffect(() => {
    if (messageRef?.current == null) {
      return;
    }
    chat.messageReplacer(messageRef.current, null, true);
  }, [messageRef]);

  return (
    <div className={styles.message}>
      <img className={styles.mascot} alt="BetterTTV Logo" src={cdn.url('assets/logos/emote_menu_logo.svg')} />
      <div ref={messageRef}>{message}</div>
    </div>
  );
}
