import {faBolt, faCloud, faMedal, faRobot} from '@fortawesome/free-solid-svg-icons';
import {Button, Text, Title} from '@mantine/core';
import {animate, motion, useAnimationFrame, useMotionValue, useTransform} from 'framer-motion';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import Icon from '@/common/components/Icon';
import LogoIcon from '@/common/components/LogoIcon';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import {ExternalLinks, UsernameEffects} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import socketClient from '@/socket-client';
import cdn from '@/utils/cdn';
import styles from './ProUpgrade.module.css';

const SHOWCASE_EFFECTS = [
  UsernameEffects.GLACIER,
  UsernameEffects.MIDAS,
  UsernameEffects.IRIDESCENCE,
  UsernameEffects.SUPERNOVA,
  UsernameEffects.INTERGALACTIC,
];

const MARQUEE_SPEED = 15;

const MARQUEE_ROWS = [
  {id: 'row-1', direction: -1},
  {id: 'row-2', direction: 1},
  {id: 'row-3', direction: -1},
  {id: 'row-4', direction: 1},
  {id: 'row-5', direction: -1},
];

const STICKER_EMOTES = [
  {id: '580e438942170bfd57189866', code: 'FeelsPumpkinMan'},
  {id: '566ca38765dbbdab32ec0560', code: 'SourPls'},
  {id: '55028cd2135896936880fdd7', code: 'D:'},
  {id: '560577560874de34757d2dc0', code: 'KappaCool'},
  {id: '5733ff12e72c3c0814233e20', code: 'FeelsAmazingMan'},
  {id: '5ffdf28dc96152314ad63960', code: 'DogChamp'},
];

const ACCENT_COLORS = ['red', 'pink', 'indigo', 'green', 'orange'];

const EMOTE_WALL_FILL_ORDER = [0, 1, 2, 3, 4, 13, 5, 12, 6, 11, 10, 9, 8, 7];

const EMOTE_WALL_EMOTES = Array.from({length: 14}, (_, slotIndex) => ({
  ...STICKER_EMOTES[slotIndex % STICKER_EMOTES.length],
  key: `wall-${slotIndex}`,
  fillOrder: EMOTE_WALL_FILL_ORDER[slotIndex],
}));

const EMOTE_WALL_TARGET = 500;

const DATA_STREAM_GLYPHS = ['0', '1', '<', '>', '{', '}', '#', '/', '$', '%', '&', '*'];

const DATA_STREAMS = [
  {id: 'stream-1', duration: 3.4, glyphClassName: 'cloudGlyphLeft'},
  {id: 'stream-2', duration: 3.0, glyphClassName: 'cloudGlyphCenter'},
  {id: 'stream-3', duration: 3.7, glyphClassName: 'cloudGlyphRight'},
];

const DATA_STREAM_SLOTS = Array.from({length: 7}, (_, slotIndex) => `slot-${slotIndex}`);

function randomGlyphColumn(length) {
  return Array.from({length}, () => DATA_STREAM_GLYPHS[Math.floor(Math.random() * DATA_STREAM_GLYPHS.length)]);
}

function handleUpgradeClick() {
  socketClient.ensureAuthentication();
  window.open(ExternalLinks.PRO, '_blank');
}

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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
    <div className={styles.showcaseCard}>
      <div className={styles.showcasePreview}>
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
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Username Effects'})}
        </Title>
      </div>
    </div>
  );
}

function EmoteStickersShowcaseCard() {
  return (
    <div className={styles.showcaseCard}>
      <div className={styles.showcaseStickersPreview}>
        {STICKER_EMOTES.map((emote) => (
          <img key={emote.id} className={styles.showcaseSticker} src={cdn.emoteUrl(emote.id)} alt={emote.code} />
        ))}
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Personal emotes, you can use anywhere'})}
        </Title>
      </div>
    </div>
  );
}

function CommandAutocompleteShowcaseCard() {
  return (
    <div className={styles.showcaseCard}>
      <div className={styles.showcaseVideoPreview}>
        <video
          className={styles.showcaseVideo}
          src={cdn.url('assets/pro/command_autocomplete.mp4')}
          autoPlay
          loop
          muted
          playsInline
        />
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Command Autocomplete'})}
        </Title>
      </div>
    </div>
  );
}

function AccentThemeShowcaseCard() {
  const [accentIndex, setAccentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAccentIndex((index) => (index + 1) % ACCENT_COLORS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.showcaseCard}>
      <div
        className={styles.showcaseAccentPreview}
        style={{'--showcase-accent': `var(--mantine-color-${ACCENT_COLORS[accentIndex]}-6)`}}>
        <div className={styles.accentWindow} aria-hidden="true">
          <div className={styles.accentWindowBar}>
            <span className={styles.accentWindowDot} />
            <span className={styles.accentWindowDot} />
            <span className={styles.accentWindowDot} />
          </div>
          <div className={styles.accentWindowBody}>
            <div className={styles.accentSidenav}>
              <span className={styles.accentNavItemActive} />
              <span className={styles.accentNavItem} />
              <span className={styles.accentNavItem} />
              <span className={styles.accentNavItem} />
            </div>
            <div className={styles.accentSettings}>
              <div className={styles.accentSettingRow}>
                <span className={styles.accentSettingBar} />
                <span className={styles.accentSwitchOn} />
              </div>
              <div className={styles.accentSettingRow}>
                <span className={styles.accentSettingBar} />
                <span className={styles.accentSwitchOff} />
              </div>
              <div className={styles.accentSettingRow}>
                <span className={styles.accentSettingBar} />
                <span className={styles.accentSwitchOn} />
              </div>
              <div className={styles.accentSettingRow}>
                <span className={styles.accentSettingBar} />
                <span className={styles.accentSwitchOff} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.accentSwatchRow} aria-hidden="true">
          {ACCENT_COLORS.map((color, colorIndex) => (
            <span key={color} className={styles.accentSwatch} data-color={color}>
              {colorIndex === accentIndex ? (
                <motion.span
                  layoutId="bttv-accent-swatch-ring"
                  className={styles.accentSwatchRing}
                  transition={{type: 'spring', stiffness: 500, damping: 30}}
                />
              ) : null}
            </span>
          ))}
        </div>
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Customizable Accent Theme'})}
        </Title>
      </div>
    </div>
  );
}

function CloudBackupShowcaseCard() {
  const [streamGlyphs, setStreamGlyphs] = useState(() => DATA_STREAMS.map(() => randomGlyphColumn(7)));

  useEffect(() => {
    const interval = setInterval(() => {
      setStreamGlyphs((columns) =>
        columns.map((column) => {
          const next = [...column];
          const glitchIndex = Math.floor(Math.random() * next.length);
          next[glitchIndex] = DATA_STREAM_GLYPHS[Math.floor(Math.random() * DATA_STREAM_GLYPHS.length)];
          return next;
        })
      );
    }, 220);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.showcaseCard}>
      <div className={styles.showcaseCloudPreview}>
        <motion.svg
          className={styles.cloudBeamSvg}
          viewBox="0 0 300 206"
          preserveAspectRatio="none"
          aria-hidden="true"
          animate={{opacity: [0.55, 1, 0.55]}}
          transition={{duration: 4, repeat: Infinity, ease: 'easeInOut'}}>
          <defs>
            <linearGradient id="bttv-cloud-beam-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="bttv-cloud-beam-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <path
            d="M128 0 C118 80 60 150 0 206 L300 206 C240 150 182 80 172 0 Z"
            fill="url(#bttv-cloud-beam-gradient)"
            filter="url(#bttv-cloud-beam-blur)"
          />
          <motion.path
            d="M138 0 C130 70 100 140 60 206 L92 206 C120 140 142 70 146 0 Z"
            fill="url(#bttv-cloud-beam-gradient)"
            filter="url(#bttv-cloud-beam-blur)"
            animate={{opacity: [0.25, 0.7, 0.25]}}
            transition={{duration: 3.2, repeat: Infinity, ease: 'easeInOut'}}
          />
          <motion.path
            d="M162 0 C170 70 200 140 240 206 L208 206 C180 140 158 70 154 0 Z"
            fill="url(#bttv-cloud-beam-gradient)"
            filter="url(#bttv-cloud-beam-blur)"
            animate={{opacity: [0.25, 0.7, 0.25]}}
            transition={{duration: 4.4, delay: 1.1, repeat: Infinity, ease: 'easeInOut'}}
          />
        </motion.svg>
        <div className={styles.cloudStreams} aria-hidden="true">
          {DATA_STREAMS.map((stream, streamIndex) => (
            <React.Fragment key={stream.id}>
              {DATA_STREAM_SLOTS.map((slotKey, slotIndex) => (
                <motion.span
                  key={`${stream.id}-${slotKey}`}
                  className={styles[stream.glyphClassName]}
                  animate={{offsetDistance: ['0%', '100%']}}
                  transition={{
                    duration: stream.duration,
                    delay: -((slotIndex * stream.duration) / 7),
                    repeat: Infinity,
                    ease: 'linear',
                  }}>
                  {streamGlyphs[streamIndex][slotIndex]}
                </motion.span>
              ))}
            </React.Fragment>
          ))}
        </div>
        <motion.span
          className={styles.cloudIconBob}
          animate={{y: [0, -4, 0]}}
          transition={{duration: 5, repeat: Infinity, ease: 'easeInOut'}}>
          <Icon icon={faCloud} size={52} className={styles.cloudIcon} />
        </motion.span>
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Cloud Settings Backups'})}
        </Title>
      </div>
    </div>
  );
}

function ChannelEmotesShowcaseCard() {
  const [filledCount, setFilledCount] = useState(0);
  const [wallCycle, setWallCycle] = useState(0);

  useEffect(() => {
    if (filledCount >= EMOTE_WALL_EMOTES.length) {
      const timeout = setTimeout(() => {
        setFilledCount(0);
        setWallCycle((cycle) => cycle + 1);
      }, 2600);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => setFilledCount((count) => count + 1), filledCount === 0 ? 700 : 110);
    return () => clearTimeout(timeout);
  }, [filledCount]);

  const complete = filledCount >= EMOTE_WALL_EMOTES.length;
  const targetCount = Math.round((filledCount * EMOTE_WALL_TARGET) / EMOTE_WALL_EMOTES.length);
  const animatedCount = useMotionValue(0);
  const roundedCount = useTransform(animatedCount, (value) => Math.round(value));

  useEffect(() => {
    if (targetCount === 0) {
      animatedCount.set(0);
      return undefined;
    }

    const controls = animate(animatedCount, targetCount, {duration: 0.35, ease: 'easeOut'});
    return () => controls.stop();
  }, [animatedCount, targetCount]);

  return (
    <div className={styles.showcaseCard}>
      <div className={styles.showcaseEmoteWallPreview}>
        <motion.div
          key={wallCycle}
          className={styles.emoteWall}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.35}}
          aria-hidden="true">
          <motion.span
            className={styles.emoteWallCounter}
            animate={{scale: complete ? [1, 1.18, 1] : 1}}
            transition={{duration: 0.45, ease: 'easeOut'}}>
            <motion.span className={styles.emoteWallCount}>{roundedCount}</motion.span>
            <span className={styles.emoteWallCountLabel}>{formatMessage({defaultMessage: 'emotes'})}</span>
          </motion.span>
          {EMOTE_WALL_EMOTES.map((emote) => (
            <span key={emote.key} className={styles.emoteWallSlot}>
              {emote.fillOrder < filledCount ? (
                <motion.img
                  className={styles.emoteWallEmote}
                  src={cdn.emoteUrl(emote.id)}
                  alt=""
                  initial={{scale: 0.3, opacity: 0}}
                  animate={{scale: 1, opacity: 1}}
                  transition={{type: 'spring', stiffness: 500, damping: 22}}
                />
              ) : null}
            </span>
          ))}
        </motion.div>
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Up to 500 Channel Emotes'})}
        </Title>
      </div>
    </div>
  );
}

function ProUpgrade() {
  const extraFeatures = [
    {icon: faMedal, name: formatMessage({defaultMessage: 'Evolving Pro chat badge'})},
    {icon: faBolt, name: formatMessage({defaultMessage: 'Priority emote approval'})},
    {icon: faRobot, name: formatMessage({defaultMessage: 'Unlimited self-bot commands'})},
  ];

  return (
    <PageScrollBody header={<PageHeader leftContent={formatMessage({defaultMessage: 'BetterTTV Pro'})} />}>
      <div className={styles.premiumContent}>
        <svg className={styles.stickerFilterDefs} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            {/* blur-and-threshold dilation: a gaussian spreads the alpha evenly in every direction
                (feMorphology's square kernel grows corners ~40% thicker than edges), then the steep
                linear transfer snaps it back to a hard, uniform-width outline */}
            <filter id="bttv-sticker-outline" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blurred" />
              <feComponentTransfer in="blurred" result="dilated">
                <feFuncA type="linear" slope="30" intercept="-3" />
              </feComponentTransfer>
              <feFlood floodColor="#ffffff" result="outlineColor" />
              <feComposite in="outlineColor" in2="dilated" operator="in" result="outline" />
              <feMerge>
                <feMergeNode in="outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <div className={styles.premiumHero}>
          <div className={styles.premiumBrand}>
            <LogoIcon className={styles.premiumLogo} />
            <span className={styles.premiumWordmark}>BetterTTV</span>
            <span className={styles.premiumPill}>{formatMessage({defaultMessage: 'Pro'})}</span>
          </div>
        </div>
        <div className={styles.featureColumns}>
          <UsernameEffectShowcaseCard />
          <AccentThemeShowcaseCard />
          <EmoteStickersShowcaseCard />
          <CloudBackupShowcaseCard />
          <CommandAutocompleteShowcaseCard />
          <ChannelEmotesShowcaseCard />
          {extraFeatures.map((feature) => (
            <div key={feature.name} className={styles.featureRow}>
              <div className={styles.featureRowIcon}>
                <Icon icon={feature.icon} size={16} />
              </div>
              <Text className={styles.featureRowName}>{feature.name}</Text>
            </div>
          ))}
        </div>
        <div className={styles.premiumActions}>
          <Button size="lg" radius="xl" variant="elevated" color="contrast" onClick={handleUpgradeClick}>
            {formatMessage({defaultMessage: 'Upgrade to Pro'})}
          </Button>
        </div>
      </div>
    </PageScrollBody>
  );
}

export default ProUpgrade;
