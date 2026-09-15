import {Title} from '@mantine/core';
import React from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import cardStyles from './ShowcaseCard.module.css';

function AccentThemeShowcaseCard() {
  return (
    <div className={cardStyles.showcaseCard}>
      <div className={cardStyles.showcasePreview}>
        {/* pre-rendered fan of paint-swatch chips, the selected accent raised out of the deck */}
        <img src={cdn.url('assets/pro/accent_fan.webp')} width="300" height="180" alt="" loading="lazy" />
        <Title order={3} className={cardStyles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Customizable Global Theming'})}
        </Title>
      </div>
    </div>
  );
}

export default AccentThemeShowcaseCard;
