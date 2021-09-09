import classNames from 'classnames';
import React from 'react';
import {createSrcSet} from '../../../utils/image.js';
import styles from '../styles/emote.module.css';

function Emote({emote, onClick, onMouseOver, active}) {
  const imageRef = React.useRef(null);
  const loadingRef = React.useRef(true);

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
      key={emote.provider.id + emote.id}
      onClick={() => onClick(emote)}
      onMouseOver={() => onMouseOver(emote)}
      onFocus={() => onMouseOver(emote)}
      type="button"
      className={classNames(styles.emote, active ? styles.active : null)}>
      <img
        ref={imageRef}
        className={classNames(styles.emoteImage, loadingRef.current ? styles.placeholder : null)}
        srcSet={createSrcSet(emote.images)}
        src={emote.images['1x']}
        alt={loadingRef.current ? '' : emote.code}
        onLoad={loadingRef.current ? handleLoad : undefined}
      />
    </button>
  );
}

export default React.memo(
  Emote,
  (oldProps, newProps) =>
    oldProps.emote.id === newProps.emote.id &&
    oldProps.active === newProps.active &&
    oldProps.onClick === newProps.onClick
);
