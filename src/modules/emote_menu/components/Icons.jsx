import classNames from 'classnames';
import {
  Box,
  Clock,
  Flag,
  Heart,
  HeartCrack,
  IceCreamCone,
  Image,
  Laugh,
  Leaf,
  Lightbulb,
  Lock,
  LockOpen,
  Plane,
  Smile,
  Star,
  Volleyball,
} from 'lucide-react';
import React from 'react';
import {TwitchMark, YoutubeMark} from '@/common/components/BrandMarks';
import styles from './Icons.module.css';

function BrandedImage({src, alt, brandSrc}) {
  return (
    <div className={styles.icon}>
      <img src={src} alt={alt} className={classNames(styles.icon, styles.iconBorderRadius)} />
      <img src={brandSrc} alt="" className={styles.brandIcon} />
    </div>
  );
}

export default {
  STAR: <Star className={styles.icon} />,
  PEOPLE: <Laugh className={styles.icon} />,
  SMILE: <Smile className={styles.icon} />,
  LEAF: <Leaf className={styles.icon} />,
  ICE_CREAM: <IceCreamCone className={styles.icon} />,
  BASKET_BALL: <Volleyball className={styles.icon} />,
  PLANE: <Plane className={styles.icon} />,
  BOX: <Box className={styles.icon} />,
  HEART: <Heart className={styles.icon} />,
  HEART_BROKEN: <HeartCrack className={styles.icon} />,
  FLAG: <Flag className={styles.icon} />,
  CLOCK: <Clock className={styles.icon} />,
  UNLOCK: <LockOpen className={styles.icon} />,
  LOCK: <Lock className={styles.icon} />,
  BULB: <Lightbulb className={styles.icon} />,
  TWITCH: <TwitchMark className={styles.icon} />,
  TWITCH_GAMING: (
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 102">
      <path d="M2.68,22.71V89.22s-.25,4.13,5.55,4.13h114.5s4.44.35,4.44-4.21V21.72l-26,27L64.92,13,30,48.7Z" />
    </svg>
  ),
  GIF: <Image className={styles.icon} />,
  YOUTUBE: <YoutubeMark className={styles.icon} />,
  IMAGE: (brandSrc, alt, src = null) =>
    src != null ? (
      <BrandedImage src={src} alt="" brandSrc={brandSrc} />
    ) : (
      <img src={brandSrc} alt="" className={classNames(styles.icon, styles.iconBorderRadius)} />
    ),
};
