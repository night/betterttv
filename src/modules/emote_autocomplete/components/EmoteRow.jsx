import classNames from 'classnames';
import React from 'react';
import {Button} from 'rsuite';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteRow.module.css';

export default function renderRow({emote, key, style, index, selected, setSelected, handleAutocomplete}) {
  return (
    <Button
      key={key}
      style={style}
      onMouseOver={() => setSelected(index)}
      onClick={() => handleAutocomplete(emote)}
      appearance="subtle"
      className={classNames(styles.emoteContainer, {[styles.active]: index === selected})}>
      <div className={styles.emote}>
        <Emote emote={emote} />
        <div className={styles.emoteCode}>{emote.code}</div>
      </div>
      <div className={styles.categoryName}>{emote.category.displayName}</div>
    </Button>
  );
}
