import React from 'react';
import styles from './EmotesHeader.module.css';

export default function EmotesHeader({getAutocomplete}) {
  const autocomplete = getAutocomplete();

  return (
    <div className={styles.header}>
      <span className={styles.matches}>Matches for </span>
      {autocomplete}
    </div>
  );
}
