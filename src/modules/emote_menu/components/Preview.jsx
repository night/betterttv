import React from 'react';
import Emote from '../../../common/components/Emote.jsx';
import emoteMenuViewStore from '../../../common/stores/emote-menu-view-store.js';
import formatMessage from '../../../i18n/index.js';
import Icons from './Icons.jsx';
import styles from './Preview.module.css';
import classNames from 'classnames';
import {Text, Title} from '@mantine/core';

const Preview = React.forwardRef(({className, emote}, ref) => {
  if (emote == null) return null;

  let icon = null;
  if (emote.metadata?.isLocked?.() ?? false) {
    icon = Icons.LOCK;
  } else if (emoteMenuViewStore.hasFavorite(emote)) {
    icon = Icons.STAR;
  }

  return (
    <div ref={ref} className={classNames(styles.preview, className)} key={emote.code}>
      <Emote className={styles.emoteImage} emote={emote} sizes={['2x', '4x']} animating />
      <div className={styles.emoteText}>
        <Title order={4} className={styles.emoteCode}>
          {emote.code}
        </Title>
        <Text c="dimmed" className={styles.emoteCategory}>
          {formatMessage({defaultMessage: 'from {name}'}, {name: emote.category.displayName})}
        </Text>
      </div>
      <div className={styles.emoteStatusIcon}>{icon}</div>
    </div>
  );
});

export default Preview;
