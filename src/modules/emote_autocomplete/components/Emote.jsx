import classNames from 'classnames';
import React from 'react';
import {Button} from 'rsuite';
import {createSrcSet} from '../../../utils/image.js';
import styles from './Emote.module.css';

export default function Emote({emote, selected, onHover}) {
  const imageRef = React.useRef(null);
  const loadingRef = React.useRef(true);

  // const shortCategoryName = emote.category.displayName.split(' ')[0];

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
    <Button
      appearance="subtle"
      size="sm"
      active={selected}
      className={styles.emoteRow}
      onMouseOver={() => onHover()}
      onFocus={() => onHover()}>
      <div className={styles.emoteInfo}>
        <img
          ref={imageRef}
          className={classNames(styles.emoteImage, loadingRef.current ? styles.placeholder : null)}
          srcSet={createSrcSet(emote.images)}
          src={emote.images['1x']}
          alt={loadingRef.current ? '' : emote.code}
          onLoad={loadingRef.current ? handleLoad : undefined}
        />
        <div>{emote.code}</div>
      </div>
    </Button>
  );
}
