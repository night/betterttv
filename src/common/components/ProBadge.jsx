import {Badge} from '@mantine/core';
import React from 'react';
import formatMessage from '@/i18n/index';

// Props (including ref) pass through to Badge so a wrapping Tooltip can anchor to it.
export default function ProBadge(props) {
  return (
    <Badge color="indigo" variant="elevated" size="lg" {...props}>
      {formatMessage({defaultMessage: 'Pro'})}
    </Badge>
  );
}
