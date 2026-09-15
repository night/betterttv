import {Title} from '@mantine/core';
import classNames from 'classnames';
import React from 'react';
import formatMessage from '@/i18n/index';
import cdn from '@/utils/cdn';
import cardStyles from './ShowcaseCard.module.css';

function CommandAutocompleteShowcaseCard() {
  return (
    <div className={classNames(cardStyles.showcaseCard, cardStyles.showcasePreview)}>
      {/* pre-rendered mock of the real command autocomplete: one row per supported bot */}
      <img src={cdn.url('assets/pro/autocomplete_panel.webp')} width="256" height="200" alt="" loading="lazy" />
      <Title order={3} className={cardStyles.showcaseLabel}>
        {formatMessage({defaultMessage: 'Autocomplete Chat Bot Commands'})}
      </Title>
    </div>
  );
}

export default CommandAutocompleteShowcaseCard;
