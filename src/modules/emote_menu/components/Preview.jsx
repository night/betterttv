import {Text, Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import Emote from '@/common/components/Emote';
import emoteMenuViewStore from '@/common/stores/emote-menu-view-store';
import formatMessage from '@/i18n/index';
import Icons from './Icons';
import styles from './Preview.module.css';

const Preview = ({className, emote, ref}) => {
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
};

export default Preview;
