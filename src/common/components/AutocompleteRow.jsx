import classNames from 'classnames';
import React from 'react';
import {Text, Title} from '@mantine/core';
import styles from './AutocompleteRow.module.css';

function AutocompleteRow({leading = null, title, subtitle, active, selected, onMouseOver, onClick, className}) {
  return (
    <button
      type="button"
      onMouseOver={onMouseOver}
      onClick={onClick}
      className={classNames(styles.row, className, {
        [styles.active]: active,
        [styles.selected]: selected,
      })}>
      {leading != null ? <span className={styles.leading}>{leading}</span> : null}
      <div className={styles.textContainer}>
        <Title className={styles.title} order={4}>
          {title}
        </Title>
        {subtitle != null && subtitle !== '' ? (
          <Text c="dimmed" className={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </div>
    </button>
  );
}

export default AutocompleteRow;
