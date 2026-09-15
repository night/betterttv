import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import cardStyles from './ShowcaseCard.module.css';

function ProBadgeShowcaseCard() {
  return (
    <div className={classNames(cardStyles.showcaseCard, cardStyles.showcasePreview)}>
      {/* pre-rendered badge slab over its sunburst — the badge art itself stays a surprise */}
      <img src={cdn.url('assets/pro/badge_award.webp')} width="360" height="360" alt="" loading="lazy" />
      <Title order={3} className={cardStyles.showcaseLabel}>
        {formatMessage({defaultMessage: 'Badges & Monthly Rewards'})}
      </Title>
    </div>
  );
}

export default ProBadgeShowcaseCard;
