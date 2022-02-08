import classNames from 'classnames';
import React from 'react';
import {createSrcSet} from '../../utils/image.js';
import styles from './Emote.module.css';

export default function Emote({emote, className}) {
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
      className={classNames(styles.emoteImage, loadingRef.current ? styles.placeholder : null, className)}
      srcSet={createSrcSet(emote.images)}
      src={emote.images['1x']}
      alt={loadingRef.current ? '' : emote.code}
      onLoad={loadingRef.current ? handleLoad : undefined}
    />
  );
}
