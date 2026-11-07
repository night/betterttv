import React from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import styles from './ProBadgeShowcaseCard.module.css';
import ShowcaseCard from './ShowcaseCard';
import cardStyles from './ShowcaseCard.module.css';

// a fixed centered slab over beams that cover the card; the badge art itself stays a surprise
function ProBadgeShowcaseCard() {
  return (
    <ShowcaseCard
      label={formatMessage({defaultMessage: 'Badges & Monthly Rewards'})}
      className={cardStyles.showcasePreview}>
      <img className={styles.badgeBeams} src={cdn.url('assets/pro/badge_beams.webp')} alt="" loading="lazy" />
      <img
        className={cardStyles.showcaseArt}
        src={cdn.url('assets/pro/badge_slab.webp')}
        width="120"
        height="136"
        alt=""
        loading="lazy"
      />
    </ShowcaseCard>
  );
}

export default ProBadgeShowcaseCard;
