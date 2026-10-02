import {Title} from '@mantine/core';
import React from 'react';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import {UsernameEffects} from '@/constants';
import formatMessage from '@/i18n/index';
import cardStyles from './ShowcaseCard.module.css';
import styles from './UsernameEffectShowcaseCard.module.css';

const SHOWCASE_EFFECTS = [
  UsernameEffects.GLACIER,
  UsernameEffects.MIDAS,
  UsernameEffects.IRIDESCENCE,
  UsernameEffects.SUPERNOVA,
  UsernameEffects.INTERGALACTIC,
];

const MARQUEE_ROW_COUNT = 5;
const MARQUEE_GROUP_COUNT = 4;

// each row starts the effect list at a different offset so no column repeats a color
function rotateEffects(offset) {
  return [...SHOWCASE_EFFECTS.slice(offset), ...SHOWCASE_EFFECTS.slice(0, offset)];
}

function ShowcaseMarqueeRow({displayName, effects, ariaHidden}) {
  const names = effects.map((effect) => (
    <UsernameEffectText key={effect} effect={effect} className={styles.showcaseName}>
      {displayName}
    </UsernameEffectText>
  ));

  return (
    <div className={styles.showcaseMarquee} aria-hidden={ariaHidden ? 'true' : undefined}>
      {Array.from({length: MARQUEE_GROUP_COUNT}, (_, groupIndex) => (
        <div
          key={groupIndex}
          className={styles.showcaseMarqueeGroup}
          aria-hidden={!ariaHidden && groupIndex > 0 ? 'true' : undefined}>
          {names}
        </div>
      ))}
    </div>
  );
}

function UsernameEffectShowcaseCard() {
  const currentUser = useCurrentUser();
  const displayName = currentUser?.displayName ?? formatMessage({defaultMessage: 'Your Username'});

  return (
    <div className={cardStyles.showcaseCard}>
      <div className={styles.showcaseMarqueeStack}>
        {Array.from({length: MARQUEE_ROW_COUNT}, (_, rowIndex) => (
          <ShowcaseMarqueeRow
            key={rowIndex}
            displayName={displayName}
            effects={rotateEffects(rowIndex)}
            ariaHidden={rowIndex > 0}
          />
        ))}
      </div>
      <Title order={3} className={cardStyles.showcaseLabel}>
        {formatMessage({defaultMessage: 'Username & Hover Effects'})}
      </Title>
    </div>
  );
}

export default UsernameEffectShowcaseCard;
