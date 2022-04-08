import React from 'react';
import styles from './Preview.module.css';
import Icons from './Icons.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import Emote from '../../../common/components/Emote.jsx';

export default function Preview({emote}) {
  if (emote == null) return null;

  let icon = null;
  if (emote.metadata != null && emote.metadata.isLocked()) {
    icon = Icons.LOCK;
  } else if (emoteMenuViewStore.hasFavorite(emote)) {
    icon = Icons.STAR;
  }

  return (
    <div className={styles.preview} key={emote.code}>
      <div className={styles.content}>
        <Emote className={styles.emoteImage} emote={emote} />
        <div>
          <div className={styles.emoteCode}>{emote.code}</div>
          <div>from {emote.category.displayName}</div>
        </div>
      </div>
      <div className={styles.emoteStatusIcon}>{icon}</div>
    </div>
  );
}
