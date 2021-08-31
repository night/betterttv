import classNames from 'classnames';
import React, {useState} from 'react';
import {createSrcSet} from '../../../utils/image.js';
import styles from '../styles/emote.module.css';

function Emote({emote, onClick, onMouseOver, active}) {
  const [loaded, setLoaded] = useState(false);

  const classnames = active ? classNames(styles.emote, styles.active) : styles.emote;
  const imageClassnames = !loaded ? classNames(styles.emoteImage, styles.hidden) : styles.emoteImage;

  return (
    <button
      key={emote.code}
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      className={classnames}>
      <img
        className={imageClassnames}
        srcSet={createSrcSet(emote.images)}
        src={emote.images['1x']}
        alt={emote.code}
        onLoad={() => setLoaded(true)}
      />
      {!loaded ? <div className={classNames(styles.emoteImage, styles.placeholder)} /> : null}
    </button>
  );
}

export default React.memo(
  Emote,
  (oldProps, newProps) => oldProps.emote.id === newProps.emote.id && oldProps.active === newProps.active
);
