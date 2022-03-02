import classNames from 'classnames';
import React from 'react';
import {Button} from 'rsuite';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteRow.module.css';

export default function EmoteRow({index, emote, active, setSelected, handleAutocomplete}) {
  return (
    <Button
      key={emote.id}
      onMouseOver={() => setSelected(index)}
      onClick={() => handleAutocomplete(emote)}
      appearance="subtle"
      className={classNames(styles.emoteContainer, {[styles.active]: active})}>
      <div className={styles.emote}>
        <Emote emote={emote} />
        <div className={styles.emoteCode}>{emote.code}</div>
      </div>
      <div>{emote.category.displayName}</div>
    </Button>
  );
}
