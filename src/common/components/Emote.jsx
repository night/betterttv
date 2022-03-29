import classNames from 'classnames';
import React from 'react';
import {createSrcSet} from '../../utils/image.js';
import styles from './Emote.module.css';

export default function Emote({emote, className, locked}) {
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

  return (
    <img
      ref={imageRef}
      className={classNames(className, styles.emoteImage, {
        [styles.placeholder]: loadingRef.current,
        [styles.emoteImageLocked]: locked,
      })}
      srcSet={createSrcSet(emote.images)}
      src={emote.images['1x']}
      alt={loadingRef.current ? '' : emote.code}
      onLoad={loadingRef.current ? handleLoad : undefined}
    />
  );
}
