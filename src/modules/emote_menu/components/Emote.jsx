import classNames from 'classnames';
import React from 'react';
import styles from '../styles/emote.module.css';

function Emote({emote, onClick, onMouseOver, active}) {
  const classnames = active ? classNames(styles.emote, styles.active) : styles.emote;

  return (
    <button
      key={emote.code}
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      className={classnames}>
      <img
        className={styles.emoteImage}
        srcSet={`${emote.images['1x']} 1x, ${emote.images['2x']} 2x, ${emote.images['3x']} 4x`}
        src={emote.images['1x']}
        alt={emote.code}
      />
    </button>
  );
}

export default React.memo(
  Emote,
  (oldProps, newProps) => oldProps.emote.id === newProps.emote.id && oldProps.active === newProps.active
);
