import React from 'react';
import LogoIcon from '@/common/components/LogoIcon';
import styles from './HighlightReasonTooltip.module.css';

function HighlightReasonTooltip({reason}) {
  return (
    <div className={styles.content}>
      <LogoIcon className={styles.logo} />
      <span>{reason}</span>
    </div>
  );
}

export default React.memo(HighlightReasonTooltip);

export function renderHighlightReasonTooltip(reason) {
  return <HighlightReasonTooltip reason={reason} />;
}
