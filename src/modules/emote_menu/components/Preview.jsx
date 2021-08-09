import React from 'react';
import Icon from 'rsuite/lib/Icon/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import styles from '../styles/menu.module.css';
import emoteStorage from '../stores/emote-storage.js';

function PreviewEmote({emote, ...restProps}) {
  return (
    <div {...restProps} key={emote.code}>
      <div className={styles.content}>
        <div className={styles.emoji}>
          <img alt={emote.name} src={emote.images['3x'] || emote.images['2x'] || emote.images['1x']} />
        </div>
        <div>
          <div className={styles.emoteCode}>{emote.code}</div>
          <p>
            from <b>{emote.provider.displayName}</b>
          </p>
        </div>
      </div>
      {emoteStorage.isFavorite(emote.id) && (
        <IconButton
          icon={
            <Icon>
              <FontAwesomeIcon icon={faStar} />
            </Icon>
          }
        />
      )}
    </div>
  );
}

export default React.memo(PreviewEmote, ({emote: a}, {emote: b}) => a === b);
