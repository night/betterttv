import classNames from 'classnames';
import React from 'react';
import {Button} from 'rsuite';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteRow.module.css';

export default function EmoteRow({key, index, emote, active, setSelected, handleAutocomplete}) {
  return (
    <Button
      key={key}
      onMouseOver={() => setSelected(index)}
      onClick={() => handleAutocomplete(emote)}
      appearance="subtle"
      className={classNames(styles.emoteRow, {[styles.active]: active})}>
      <div className={styles.emoteInfoContainer}>
        <Emote className={styles.emote} emote={emote} />
        <div>{emote.code}</div>
      </div>
      <div className={styles.categoryName}>{emote.category.displayName}</div>
    </Button>
  );
}
