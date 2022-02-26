import classNames from 'classnames';
import React from 'react';
import {createSrcSet} from '../../utils/image.js';
import styles from './Emote.module.css';

export default function Emote({emote, onClick, onMouseOver, active, isButton = true}) {
  const imageRef = React.useRef(null);
  const loadingRef = React.useRef(true);

  function handleLoad() {
    window.requestAnimationFrame(() => {
      const currentImageRef = imageRef.current;
      if (currentImageRef == null) {
        return;
      }

      loadingRef.current = false;
      currentImageRef.classList.remove(styles.placeholder);
    });
  }

  const Image = (
    <img
      ref={imageRef}
      className={classNames(styles.emoteImage, loadingRef.current ? styles.placeholder : null)}
      srcSet={createSrcSet(emote.images)}
      src={emote.images['1x']}
      alt={loadingRef.current ? '' : emote.code}
      onLoad={loadingRef.current ? handleLoad : undefined}
    />
  );

  if (!isButton) {
    return <div className={classNames(styles.emote, active ? styles.active : null)}>{Image}</div>;
  }

  return (
    <button
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      className={classNames(styles.emote, active ? styles.active : null)}>
      {Image}
    </button>
  );
}
