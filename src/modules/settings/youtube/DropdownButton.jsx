import React from 'react';
import styles from './Settings.module.css';
import formatMessage from '../../../i18n/index.js';

export default function DropdownButton(props) {
  return (
    <div {...props} className={styles.button}>
      <div className={styles.buttonIconContainer}>
        <div className={styles.buttonIcon} />
      </div>
      <div className={styles.buttonLabel}>{formatMessage({defaultMessage: 'BetterTTV Settings'})}</div>
    </div>
  );
}
