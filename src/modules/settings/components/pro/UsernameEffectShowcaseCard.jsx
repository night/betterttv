import {Title} from '@mantine/core';
import {motion, useAnimationFrame, useMotionValue} from 'framer-motion';
import shuffle from 'lodash.shuffle';
import React, {useMemo, useRef} from 'react';
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

const MARQUEE_SPEED = 6;

const MARQUEE_ROWS = [
  {id: 'row-1', direction: -1},
  {id: 'row-2', direction: 1},
  {id: 'row-3', direction: -1},
  {id: 'row-4', direction: 1},
  {id: 'row-5', direction: -1},
];

// js-driven on purpose: a css transform animation of these rows measured 23fps in chrome
// (it refuses to composite the huge gradient-text rows), while rAF-driven motion values on
// promoted layers hold 60fps. don't "simplify" this to a css animation without profiling.
function ShowcaseMarqueeRow({displayName, effects, direction, ariaHidden}) {
  const x = useMotionValue(0);
  const groupRef = useRef(null);

  useAnimationFrame((time, delta) => {
    const group = groupRef.current;
    if (group == null) {
      return;
    }

    const width = group.offsetWidth;
    if (width === 0) {
      return;
    }

    let next = x.get() + (direction * MARQUEE_SPEED * delta) / 1000;
    if (next <= -width) {
      next += width;
    }
    if (next > 0) {
      next -= width;
    }
    x.set(next);
  });

  const names = effects.map((effect) => (
    <UsernameEffectText key={effect} effect={effect} className={styles.showcaseName}>
      {displayName}
    </UsernameEffectText>
  ));

  return (
    <motion.div className={styles.showcaseMarquee} style={{x}} aria-hidden={ariaHidden ? 'true' : undefined}>
      {Array.from({length: 4}, (_, groupIndex) => (
        <div
          key={groupIndex}
          ref={groupIndex === 0 ? groupRef : undefined}
          className={styles.showcaseMarqueeGroup}
          aria-hidden={!ariaHidden && groupIndex > 0 ? 'true' : undefined}>
          {names}
        </div>
      ))}
    </motion.div>
  );
}

function UsernameEffectShowcaseCard() {
  const currentUser = useCurrentUser();
  const displayName = currentUser?.displayName ?? formatMessage({defaultMessage: 'Your Username'});
  const rowEffects = useMemo(() => MARQUEE_ROWS.map(() => shuffle(SHOWCASE_EFFECTS)), []);

  return (
    <div className={cardStyles.showcaseCard}>
      <div className={styles.showcaseMarqueeStack}>
        {MARQUEE_ROWS.map(({id, direction}, rowIndex) => (
          <ShowcaseMarqueeRow
            key={id}
            displayName={displayName}
            effects={rowEffects[rowIndex]}
            direction={direction}
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
