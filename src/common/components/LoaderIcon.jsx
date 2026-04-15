import React from 'react';
import classNames from 'classnames';
import styles from './LoaderIcon.module.css';

export function LoaderIconIndicator({className}) {
  return <div className={classNames(styles.indicator, className)} />;
}

export function LoaderIconSuccess({className}) {
  return <div className={classNames(styles.checkmark, className)} />;
}

export function LoaderIconError({className}) {
  return <div className={classNames(styles.error, className)} />;
}
