import React from 'react';
import IconButton from 'rsuite/lib/Button/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import styles from '../styles/menu.module.css';

export default function PreviewEmote({emote, ...restProps}) {
  if (!emote) {
    return (
      <div {...restProps} key="placeholder">
        <div className={styles.content}>
          <div className={styles.emoji}>
            <div className={styles.placeholder} />
          </div>
          <div>
            <p>Emoji Name</p>
            <p>Channel Name</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div {...restProps} key={emote.code}>
      <div className={styles.content}>
        <div className={styles.emoji}>
          <img alt={emote.name} src={emote.images['3x'] || emote.images['2x'] || emote.images['1x']} />
        </div>
        <div>
          <p>{emote.code}</p>
          <p>
            from <b>{emote.provider.displayName}</b>
          </p>
        </div>
      </div>
      <IconButton appearance="subtle">
        <Icon>
          <FontAwesomeIcon icon={faStar} />
        </Icon>
      </IconButton>
    </div>
  );
}
