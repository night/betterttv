import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import styles from './PriorityApprovalShowcaseCard.module.css';
import cardStyles from './ShowcaseCard.module.css';

function PriorityApprovalShowcaseCard() {
  return (
    <div className={classNames(cardStyles.showcaseCard, cardStyles.showcasePreview)}>
      {/* a pre-rendered theme-park fastpass */}
      <img className={styles.ticketArt} src={cdn.url('assets/pro/approval_ticket.webp')} alt="" loading="lazy" />
      <Title order={3} className={cardStyles.showcaseLabel}>
        {formatMessage({defaultMessage: 'Your Emotes, Approved First'})}
      </Title>
    </div>
  );
}

export default PriorityApprovalShowcaseCard;
