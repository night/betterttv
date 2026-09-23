import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import cdn from '@/utils/cdn';
import cardStyles from './ShowcaseCard.module.css';

// the animated originals were baked to webp so the page scrolls at 60fps
function ShowcaseImageCard({image, width, height, label, imageClassName}) {
  return (
    <div className={classNames(cardStyles.showcaseCard, cardStyles.showcasePreview)}>
      <img
        className={classNames(cardStyles.showcaseArt, imageClassName)}
        src={cdn.url(`assets/pro/${image}.webp`)}
        width={width}
        height={height}
        alt=""
        loading="lazy"
      />
      <Title order={3} className={cardStyles.showcaseLabel}>
        {label}
      </Title>
    </div>
  );
}

export default ShowcaseImageCard;
