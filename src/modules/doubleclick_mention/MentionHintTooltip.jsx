import React from 'react';
import LogoIcon from '@/common/components/LogoIcon';
import formatMessage from '@/i18n';
import styles from './MentionHintTooltip.module.css';

function MentionHintTooltip() {
  return (
    <div className={styles.content}>
      <LogoIcon className={styles.logo} />
      <span>{formatMessage({defaultMessage: 'Double-click to mention'})}</span>
    </div>
  );
}

export default React.memo(MentionHintTooltip);
