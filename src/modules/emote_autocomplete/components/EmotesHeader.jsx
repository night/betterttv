import React from 'react';
import styles from './EmotesHeader.module.css';

export default function EmotesHeader({chatInputPartialEmote}) {
  return (
    <div className={styles.header}>
      <span className={styles.matches}>Matches for </span>
      {chatInputPartialEmote}
    </div>
  );
}
