import classNames from 'classnames';
import React, {useMemo} from 'react';
import {createSrcSet} from '../../../utils/image.js';
import styles from './Emote.module.css';

export default function Emote({emote, onClick, onMouseOver, active, currentEmoteSetIds}) {
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

  const locked = useMemo(
    () => (emote.metadata != null ? emote.metadata.isLocked(currentEmoteSetIds) : false),
    [currentEmoteSetIds]
  );

  return (
    <button
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      disabled={locked}
      className={classNames(styles.emote, active ? styles.active : null)}>
      <img
        ref={imageRef}
        className={classNames(
          styles.emoteImage,
          loadingRef.current ? styles.placeholder : null,
          locked ? styles.emoteImageLocked : null
        )}
        srcSet={createSrcSet(emote.images)}
        src={emote.images['1x']}
        alt={loadingRef.current ? '' : emote.code}
        onLoad={loadingRef.current ? handleLoad : undefined}
      />
    </button>
  );
}
