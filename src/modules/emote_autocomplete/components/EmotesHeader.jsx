import React, {useMemo} from 'react';
import styles from './EmotesHeader.module.css';

export default function EmotesHeader({chatInputPartialEmote}) {
  const partialInput = useMemo(
    () => chatInputPartialEmote.slice(1, chatInputPartialEmote.length),
    [chatInputPartialEmote]
  );

  return (
    <div className={styles.header}>
      <span className={styles.matches}>Matches for </span>
      {partialInput}
    </div>
  );
}
