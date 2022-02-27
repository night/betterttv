import React from 'react';
import {getAutocompletable} from '../../../utils/autocomplete.js';
import styles from './EmotesHeader.module.css';

export default function EmotesHeader() {
  const autocomplete = getAutocompletable();

  return (
    <div className={styles.header}>
      <span className={styles.matches}>Matches for </span>
      {autocomplete}
    </div>
  );
}
