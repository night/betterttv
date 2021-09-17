import classNames from 'classnames';
import React, {useEffect, useState} from 'react';
import {createSrcSet} from '../../../utils/image.js';
import styles from '../styles/emote.module.css';

export default function Emote({emote, onClick, onMouseOver, active, pixelRatio}) {
  const [hash, setHash] = useState(Date.now());
  const imageRef = React.useRef(null);
  const loadingRef = React.useRef(true);

  useEffect(() => setHash(Date.now()), [pixelRatio]);

  function handleLoad() {
    window.requestAnimationFrame(() => {
      if (imageRef.current == null) {
        return;
      }

      loadingRef.current = false;
      imageRef.current.classList.remove(styles.placeholder);
    });
  }

  return (
    <button
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      className={classNames(styles.emote, active ? styles.active : null)}
    >
      <img
        ref={imageRef}
        className={classNames(styles.emoteImage, loadingRef.current ? styles.placeholder : null)}
        srcSet={createSrcSet(emote.images, hash)}
        src={`${emote.images['1x']}?${hash}`}
        alt={loadingRef.current ? '' : emote.code}
        onLoad={loadingRef.current ? handleLoad : undefined}
      />
    </button>
  );
}
