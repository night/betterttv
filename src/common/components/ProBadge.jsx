import {Badge} from '@mantine/core';
import React, {use} from 'react';
import {PageTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import {PageContext} from '@/modules/settings/contexts/PageContext';
import styles from './ProBadge.module.css';

// Props (including ref) pass through to Badge so a wrapping Tooltip can anchor to it.
export default function ProBadge({clickable = true, ...props}) {
  const pageContext = use(PageContext);

  if (!clickable || pageContext == null) {
    return (
      <Badge color="indigo" variant="elevated" size="lg" {...props}>
        {formatMessage({defaultMessage: 'Pro'})}
      </Badge>
    );
  }

  function handleClick(event) {
    event.stopPropagation();
    pageContext.setPage(PageTypes.PRO_UPGRADE);
    pageContext.setSidenavOpen(false);
  }

  return (
    <Badge color="indigo" variant="elevated" size="lg" {...props} className={styles.clickable} onClick={handleClick}>
      {formatMessage({defaultMessage: 'Pro'})}
    </Badge>
  );
}
