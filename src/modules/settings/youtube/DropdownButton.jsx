import React from 'react';
import styles from './Settings.module.css';

export default function DropdownButton(props) {
  return (
    <div {...props} className={styles.button}>
      <div className={styles.buttonIcon} />
      <div className={styles.buttonLabel}>BetterTTV Settings</div>
    </div>
  );
}
