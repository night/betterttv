import classNames from 'classnames';
import React from 'react';
import Emote from '../../../common/components/Emote.jsx';
import styles from './EmoteRow.module.css';
import {Text, Title} from '@mantine/core';

function EmoteRow({key, item: emote, active, selected, onMouseOver, onClick}) {
  return (
    <button
      key={key}
      onMouseOver={onMouseOver}
      onClick={onClick}
      className={classNames(styles.emoteRow, {
        [styles.active]: active,
        [styles.selected]: selected,
      })}>
      <Emote className={styles.emote} emote={emote} />
      <div className={styles.emoteContainer}>
        <Title className={styles.emoteCode} order={4}>
          {emote.code}
        </Title>
        <Text c="dimmed" className={styles.categoryName}>
          {emote.category.displayName}
        </Text>
      </div>
    </button>
  );
}

export default EmoteRow;
