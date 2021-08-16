import React from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import styles from '../styles/preview.module.css';
import emoteStorage from '../stores/emote-storage.js';

function PreviewEmote({emote}) {
  return (
    <div className={styles.preview} key={emote.code}>
      <div className={styles.content}>
        <div className={styles.emoji}>
          <img
            alt={emote.name}
            className={styles.emoteImage}
            srcSet={`${emote.images['1x']} 1x, ${emote.images['2x']} 2x, ${emote.images['3x']} 4x`}
            src={emote.images['2x']}
          />
        </div>
        <div>
          <div className={styles.emoteCode}>{emote.code}</div>
          <div>from {emote.provider.displayName}</div>
        </div>
      </div>
      {emoteStorage.getFavorites().includes(emote.id) ? (
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

export default React.memo(PreviewEmote, ({emote: a}, {emote: b}) => a === b);
