import {
  faBasketballBall,
  faBox,
  faClock,
  faFlag,
  faHeart,
  faHeartBroken,
  faIceCream,
  faLeaf,
  faLightbulb,
  faLock,
  faPlane,
  faSmileWink,
  faStar,
  faUnlock,
} from '@fortawesome/free-solid-svg-icons';
import {faTwitch, faYoutube} from '@fortawesome/free-brands-svg-icons';
import classNames from 'classnames';
import React from 'react';
import styles from './Icons.module.css';
import Icon from '../../../common/components/Icon.jsx';

function BrandedImage({src, alt, brandSrc}) {
  return (
    <div className={styles.icon}>
      <img src={src} alt={alt} className={classNames(styles.icon, styles.iconBorderRadius)} />
      <img src={brandSrc} alt="" className={styles.brandIcon} />
    </div>
  );
}

export default {
  STAR: <Icon icon={faStar} className={styles.icon} />,
  PEOPLE: <Icon icon={faSmileWink} className={styles.icon} />,
  LEAF: <Icon icon={faLeaf} className={styles.icon} />,
  ICE_CREAM: <Icon icon={faIceCream} className={styles.icon} />,
  BASKET_BALL: <Icon icon={faBasketballBall} className={styles.icon} />,
  PLANE: <Icon icon={faPlane} className={styles.icon} />,
  BOX: <Icon icon={faBox} className={styles.icon} />,
  HEART: <Icon icon={faHeart} className={styles.icon} />,
  HEART_BROKEN: <Icon icon={faHeartBroken} className={styles.icon} />,
  FLAG: <Icon icon={faFlag} className={styles.icon} />,
  CLOCK: <Icon icon={faClock} className={styles.icon} />,
  UNLOCK: <Icon icon={faUnlock} className={styles.icon} />,
  LOCK: <Icon icon={faLock} className={styles.icon} />,
  BULB: <Icon icon={faLightbulb} className={styles.icon} />,
  TWITCH: <Icon icon={faTwitch} className={styles.icon} />,
  TWITCH_GAMING: (
    <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 102">
      <path d="M2.68,22.71V89.22s-.25,4.13,5.55,4.13h114.5s4.44.35,4.44-4.21V21.72l-26,27L64.92,13,30,48.7Z" />
    </svg>
  ),
  YOUTUBE: <Icon icon={faYoutube} className={styles.icon} />,
  IMAGE: (brandSrc, alt, src = null) =>
    src != null ? (
      <BrandedImage src={src} alt="" brandSrc={brandSrc} />
    ) : (
      <img src={brandSrc} alt="" className={classNames(styles.icon, styles.iconBorderRadius)} />
    ),
};
