import {Title} from '@mantine/core';
import React from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import cardStyles from './ShowcaseCard.module.css';

function EmoteStickersShowcaseCard() {
  return (
    <div className={cardStyles.showcaseCard}>
      <div className={cardStyles.showcasePreview}>
        {/* pre-rendered grid of die-cut holo stickers: the outline svg filter (blur + dilate +
            foil noise) re-rasterized on every scroll frame, so the whole grid is one bake */}
        <img src={cdn.url('assets/pro/emote_stickers.webp')} width="328" height="160" alt="" loading="lazy" />
        <Title order={3} className={cardStyles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Up to 500 Channel & 50 Personal Emotes'})}
        </Title>
      </div>
    </div>
  );
}

export default EmoteStickersShowcaseCard;
