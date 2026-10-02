import {Text} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import styles from './EmptyState.module.css';
import Icons from './Icons';

function EmptyState({ref, className, children, ...props}) {
  return (
    <div ref={ref} className={classNames(styles.empty, className)} {...props}>
      <div className={styles.emptyIcon}>{Icons.HEART_BROKEN}</div>
      <Text className={styles.emptyText} c="dimmed">
        {children}
      </Text>
    </div>
  );
}

export default EmptyState;
