import classNames from 'classnames';
import React from 'react';
import {Text, Title} from '@mantine/core';
import styles from './AutocompleteRow.module.css';

function AutocompleteRow({
  leading = null,
  title,
  subtitle,
  active,
  selected,
  onMouseOver,
  onClick,
  className,
  subtitleClassName,
}) {
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
          <Text c="dimmed" className={classNames(styles.subtitle, subtitleClassName)}>
            {subtitle}
          </Text>
        ) : null}
      </div>
    </button>
  );
}

export default React.memo(AutocompleteRow, (prev, next) => {
  return (
    prev.title === next.title &&
    prev.subtitle === next.subtitle &&
    prev.leading === next.leading &&
    prev.selected === next.selected &&
    prev.active === next.active &&
    prev.className === next.className &&
    prev.subtitleClassName === next.subtitleClassName
  );
});
