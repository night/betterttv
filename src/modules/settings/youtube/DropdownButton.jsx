import React from 'react';
import styles from './DropdownButton.module.css';

export default function DropdownButton(props) {
  return (
    <button {...props} className={styles.button} type="button">
      BetterTTV Settings
    </button>
  );
}
