import classNames from 'classnames';
import React from 'react';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteButton.module.css';

export default function EmoteButton({emote, onClick, onMouseOver, active}) {
  return (
    <button
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      className={classNames(styles.emote, active ? styles.active : null)}>
      <Emote emote={emote} />
    </button>
  );
}
