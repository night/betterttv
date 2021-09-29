import React from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import styles from './Preview.module.css';
import {createSrcSet} from '../../../utils/image.js';

export default function Preview({emote, isFavorite}) {
  if (emote == null) return null;

  return (
    <div className={styles.preview} key={emote.code}>
      <div className={styles.content}>
        <div className={styles.emote}>
          <img
            alt={emote.name}
            className={styles.emoteImage}
            srcSet={createSrcSet(emote.images, ['2x', '4x'])}
            src={emote.images['2x'] || emote.images['1x']}
          />
        </div>
        <div>
          <div className={styles.emoteCode}>{emote.code}</div>
          <div>from {emote.category.displayName}</div>
        </div>
      </div>
      {isFavorite ? (
        <IconButton
          icon={
            <Icon>
              <FontAwesomeIcon icon={faStar} />
            </Icon>
          }
        />
      ) : null}
    </div>
  );
}
