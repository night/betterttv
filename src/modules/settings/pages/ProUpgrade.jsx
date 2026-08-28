import {faArrowUpRightFromSquare, faBolt, faCheck, faHeart, faRobot} from '@fortawesome/free-solid-svg-icons';
import {Anchor, Button, Text, Title} from '@mantine/core';
import {motion, useAnimationFrame, useMotionValue} from 'framer-motion';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';
import Icon from '@/common/components/Icon';
import LogoIcon from '@/common/components/LogoIcon';
import UsernameEffectText from '@/common/components/UsernameEffectText';
import useCurrentUser from '@/common/hooks/CurrentUser';
import {ExternalLinks, UsernameEffects} from '@/constants';
import formatMessage from '@/i18n/index';
import PageHeader from '@/modules/settings/components/PageHeader';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';
import socketClient from '@/socket-client';
import useAuthStore from '@/stores/auth';
import cdn from '@/utils/cdn';
import {isUserPro} from '@/utils/pro';
import styles from './ProUpgrade.module.css';

const SHOWCASE_EFFECTS = [
  UsernameEffects.GLACIER,
  UsernameEffects.MIDAS,
  UsernameEffects.IRIDESCENCE,
  UsernameEffects.SUPERNOVA,
  UsernameEffects.INTERGALACTIC,
];

const MARQUEE_SPEED = 9;

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

const DATA_STREAM_GLYPHS = ['0', '1', '<', '>', '{', '}', '#', '/', '$', '%', '&', '*'];

const DATA_STREAMS = [
  {id: 'stream-1', duration: 15, glyphClassName: 'cloudGlyphOuterLeft'},
  {id: 'stream-2', duration: 12.4, glyphClassName: 'cloudGlyphLeft'},
  {id: 'stream-3', duration: 11, glyphClassName: 'cloudGlyphCenter'},
  {id: 'stream-4', duration: 13.5, glyphClassName: 'cloudGlyphRight'},
  {id: 'stream-5', duration: 16, glyphClassName: 'cloudGlyphOuterRight'},
];

const DATA_STREAM_SLOTS = Array.from({length: 12}, (_, slotIndex) => `slot-${slotIndex}`);

function randomGlyphColumn(length) {
  return Array.from({length}, () => DATA_STREAM_GLYPHS[Math.floor(Math.random() * DATA_STREAM_GLYPHS.length)]);
}

function handleUpgradeClick() {
  socketClient.ensureAuthentication();
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
          {formatMessage({defaultMessage: 'Username & Hover Effects'})}
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
          {formatMessage({defaultMessage: 'Up to 500 Channel & 50 Personal Emotes'})}
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
  return (
    <div className={styles.showcaseCard}>
      <div className={styles.showcaseAccentPreview}>
        {/* a fan of paint-swatch chips, the selected accent raised with the logo and a check —
            static, physical, in the same object language as the stickers and the server */}
        <div className={styles.accentFan} aria-hidden="true">
          <span className={styles.accentFanCard} data-color="red">
            <span className={styles.accentFanLabel} />
            <span className={styles.accentFanLabelSmall} />
          </span>
          <span className={styles.accentFanCard} data-color="orange">
            <span className={styles.accentFanLabel} />
            <span className={styles.accentFanLabelSmall} />
          </span>
          <span className={styles.accentFanCard} data-color="green">
            <span className={styles.accentFanLabel} />
            <span className={styles.accentFanLabelSmall} />
          </span>
          <span className={styles.accentFanCard} data-color="pink">
            <span className={styles.accentFanLabel} />
            <span className={styles.accentFanLabelSmall} />
          </span>
          <span className={styles.accentFanCard} data-color="indigo">
            <LogoIcon className={styles.accentFanLogo} />
            <span className={styles.accentFanLabel} />
            <span className={styles.accentFanLabelSmall} />
            <span className={styles.accentFanCheck}>
              <Icon icon={faCheck} size={11} />
            </span>
          </span>
        </div>
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Customizable Accent Theme'})}
        </Title>
      </div>
    </div>
  );
}

function CloudGraphic() {
  return (
    <svg className={styles.cloudGraphic} viewBox="0 0 300 200" aria-hidden="true">
      <defs>
        {/* each layer is blurred BEFORE displacement so the noise tears a soft alpha gradient
            into vapor instead of chipping a hard edge; low baseFrequency + large scale makes
            billows, and the geometry oversizes the viewBox so displaced fringes never expose
            a clipped straight edge */}
        <filter id="bttv-cloud-back" x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="11" result="noise" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="soft" />
          <feDisplacementMap in="soft" in2="noise" scale="110" />
        </filter>
        <filter id="bttv-cloud-mid" x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="4" result="noise" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="soft" />
          <feDisplacementMap in="soft" in2="noise" scale="90" />
        </filter>
        <filter id="bttv-cloud-front" x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="soft" />
          <feDisplacementMap in="soft" in2="noise" scale="70" />
        </filter>
      </defs>
      {/* shadowed belly, hangs lowest */}
      <g filter="url(#bttv-cloud-back)" fill="#b7c4ec" opacity="0.4">
        <rect x="-80" y="-60" width="460" height="165" />
        <ellipse cx="60" cy="118" rx="70" ry="28" />
        <ellipse cx="160" cy="128" rx="80" ry="30" />
        <ellipse cx="255" cy="118" rx="70" ry="28" />
      </g>
      {/* mid tone */}
      <g filter="url(#bttv-cloud-mid)" fill="#e2e9fc" opacity="0.48">
        <rect x="-80" y="-60" width="460" height="152" />
        <ellipse cx="45" cy="103" rx="65" ry="26" />
        <ellipse cx="150" cy="112" rx="78" ry="30" />
        <ellipse cx="252" cy="103" rx="66" ry="26" />
      </g>
      {/* sunlit crown */}
      <g filter="url(#bttv-cloud-front)" fill="#ffffff" opacity="0.62">
        <rect x="-80" y="-60" width="460" height="136" />
        <ellipse cx="70" cy="88" rx="58" ry="22" />
        <ellipse cx="165" cy="96" rx="70" ry="26" />
        <ellipse cx="258" cy="86" rx="55" ry="20" />
      </g>
    </svg>
  );
}

function CloudBackupShowcaseCard() {
  const [streamGlyphs, setStreamGlyphs] = useState(() =>
    DATA_STREAMS.map(() => randomGlyphColumn(DATA_STREAM_SLOTS.length))
  );

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
    }, 350);
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
          transition={{duration: 6.5, repeat: Infinity, ease: 'easeInOut'}}>
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
            d="M128 0 C122 74 90 132 46 206 L254 206 C210 132 178 74 172 0 Z"
            fill="url(#bttv-cloud-beam-gradient)"
            filter="url(#bttv-cloud-beam-blur)"
          />
          <motion.path
            d="M138 0 C132 74 116 132 84 206 L110 206 C132 132 144 74 148 0 Z"
            fill="url(#bttv-cloud-beam-gradient)"
            filter="url(#bttv-cloud-beam-blur)"
            animate={{opacity: [0.25, 0.7, 0.25]}}
            transition={{duration: 5.2, repeat: Infinity, ease: 'easeInOut'}}
          />
          <motion.path
            d="M162 0 C168 74 184 132 216 206 L190 206 C168 132 156 74 152 0 Z"
            fill="url(#bttv-cloud-beam-gradient)"
            filter="url(#bttv-cloud-beam-blur)"
            animate={{opacity: [0.25, 0.7, 0.25]}}
            transition={{duration: 7, delay: 1.8, repeat: Infinity, ease: 'easeInOut'}}
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
                    delay: -((slotIndex * stream.duration) / DATA_STREAM_SLOTS.length),
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
          transition={{duration: 8, repeat: Infinity, ease: 'easeInOut'}}>
          <CloudGraphic />
        </motion.span>
        <span className={styles.cloudAppIcon} aria-hidden="true">
          <span className={styles.cloudAppIconBody}>
            <span className={styles.cloudAppIconSlab} />
            <span className={styles.cloudAppIconFace}>
              <LogoIcon className={styles.cloudAppIconLogo} />
              <span className={styles.cloudAppIconLed} />
            </span>
          </span>
        </span>
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Cloud Backups'})}
        </Title>
      </div>
    </div>
  );
}

// edgeColor is each badge's average art color darkened ~40%, so the extruded lip reads as
// the badge's own thickness (mirroring the accent chips' color-8 edges)
const PRO_BADGE_FAN = [
  {months: 36, fileId: '41927fef-9dbf-4ff1-9de1-9b09095328c6', className: 'badgeFanOuterLeft', edgeColor: '#963c4c'},
  {months: 12, fileId: '0d008148-5036-43fd-aff6-e838ee7b7f94', className: 'badgeFanLeft', edgeColor: '#946007'},
  {months: 24, fileId: '70891c2b-eec4-4ce8-86d9-a3de94919b89', className: 'badgeFanCenter', edgeColor: '#444a98'},
  {months: 84, fileId: '0260f418-9f27-405e-bd03-422b36d818a7', className: 'badgeFanRight', edgeColor: '#367933'},
  {months: 18, fileId: '14ecc0f1-5df1-40e7-b10f-441cee3c6d1a', className: 'badgeFanOuterRight', edgeColor: '#396588'},
];

function EvolvingBadgeShowcaseCard() {
  return (
    <div className={styles.showcaseCard}>
      <div className={styles.showcaseBadgePreview}>
        <div className={styles.badgeFan} aria-hidden="true">
          {PRO_BADGE_FAN.map((badge) => (
            <span
              key={badge.months}
              className={`${styles.badgeTile} ${styles[badge.className]}`}
              style={{'--badge-edge': badge.edgeColor}}>
              <img className={styles.badgeTileImage} src={cdn.url(`badges/pro/${badge.fileId}.png`)} alt="" />
            </span>
          ))}
        </div>
        <Title order={3} className={styles.showcaseLabel}>
          {formatMessage({defaultMessage: 'Evolving Pro chat badge'})}
        </Title>
      </div>
    </div>
  );
}

function ProUpgrade() {
  const user = useAuthStore(useShallow((state) => state.user));
  const isPro = isUserPro(user);

  const extraFeatures = [
    {icon: faBolt, name: formatMessage({defaultMessage: 'Priority emote approval'})},
    {icon: faRobot, name: formatMessage({defaultMessage: 'Unlimited self-bot commands'})},
  ];

  return (
    <PageScrollBody
      header={
        <PageHeader
          breadcrumbs={[
            {label: formatMessage({defaultMessage: 'BetterTTV Pro'})},
            {label: formatMessage({defaultMessage: 'Perks'})},
          ]}
        />
      }
      footer={
        <div className={styles.premiumActions}>
          <Text className={styles.premiumThanks}>
            <Icon icon={faHeart} size={14} className={styles.premiumThanksHeart} />
            {formatMessage({defaultMessage: 'Thank you for supporting BetterTTV'})}
          </Text>
          <Button
            component={Anchor}
            href={ExternalLinks.PRO}
            target="_blank"
            rel="noopener noreferrer"
            underline="never"
            size="lg"
            radius="xl"
            variant="elevated"
            color="contrast"
            rightSection={<Icon icon={faArrowUpRightFromSquare} size={14} />}
            onClick={handleUpgradeClick}>
            {isPro
              ? formatMessage({defaultMessage: 'Manage Subscription'})
              : formatMessage({defaultMessage: 'Upgrade to Pro'})}
          </Button>
        </div>
      }>
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
              {/* holo foil: pastel rainbow fractal noise (lifted toward white) fills the
                  outline instead of a flat flood, so the die-cut edge shimmers like foil */}
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="9" result="foilNoise">
                <animate attributeName="baseFrequency" values="0.045;0.065;0.045" dur="7s" repeatCount="indefinite" />
              </feTurbulence>
              <feColorMatrix
                in="foilNoise"
                type="matrix"
                values="1.2 0 0 0 0.25 0 1.2 0 0 0.25 0 0 1.2 0 0.25 0 0 0 0 1"
                result="foil"
              />
              <feComposite in="foil" in2="dilated" operator="in" result="outline" />
              <feMerge>
                <feMergeNode in="outline" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <div className={styles.featureColumns}>
          <UsernameEffectShowcaseCard />
          <EmoteStickersShowcaseCard />
          <CommandAutocompleteShowcaseCard />
          <AccentThemeShowcaseCard />
          <CloudBackupShowcaseCard />
          <EvolvingBadgeShowcaseCard />
          {extraFeatures.map((feature) => (
            <div key={feature.name} className={styles.featureRow}>
              <div className={styles.featureRowIcon}>
                <Icon icon={feature.icon} size={16} />
              </div>
              <Text className={styles.featureRowName}>{feature.name}</Text>
            </div>
          ))}
        </div>
      </div>
    </PageScrollBody>
  );
}

export default ProUpgrade;
