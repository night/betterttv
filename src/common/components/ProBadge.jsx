import {Badge} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import formatMessage from '@/i18n/index';
import styles from './ProBadge.module.css';

// Props pass through so a wrapping Tooltip can anchor; onClick renders it as a real button.
export default function ProBadge({onClick, className, ...props}) {
  return (
    <Badge
      color="indigo"
      variant="elevated"
      size="lg"
      {...props}
      component={onClick != null ? 'button' : undefined}
      type={onClick != null ? 'button' : undefined}
      onClick={onClick}
      className={classNames(className, {[styles.clickable]: onClick != null})}>
      {formatMessage({defaultMessage: 'Pro'})}
    </Badge>
  );
}
