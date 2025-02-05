import classNames from 'classnames';
import React from 'react';
import {Button} from 'rsuite';
import styles from './CommandRow.module.css';

export default function CommandRow({key, index, command, active, setSelected, handleAutocomplete}) {
  return (
    <Button
      key={key}
      onMouseOver={() => setSelected(index)}
      onClick={() => handleAutocomplete(command)}
      appearance="subtle"
      className={classNames(styles.commandRow, {[styles.active]: active})}>
      <div className={styles.commandInfoContainer}>
        <div>{command.name}</div>
      </div>
    </Button>
  );
}
