import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import {faSmile} from '@fortawesome/free-solid-svg-icons/faSmile';
import {faDog} from '@fortawesome/free-solid-svg-icons/faDog';
import {faThumbsUp} from '@fortawesome/free-solid-svg-icons/faThumbsUp';
import {faSmileWink} from '@fortawesome/free-solid-svg-icons/faSmileWink';
import {faLeaf} from '@fortawesome/free-solid-svg-icons/faLeaf';
import {faIceCream} from '@fortawesome/free-solid-svg-icons/faIceCream';
import {faBasketballBall} from '@fortawesome/free-solid-svg-icons/faBasketballBall';
import {faPlane} from '@fortawesome/free-solid-svg-icons/faPlane';
import {faBox} from '@fortawesome/free-solid-svg-icons/faBox';
import {faHeart} from '@fortawesome/free-solid-svg-icons/faHeart';
import {faHeartBroken} from '@fortawesome/free-solid-svg-icons/faHeartBroken';
import {faFlag} from '@fortawesome/free-solid-svg-icons/faFlag';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';
import {faUnlock} from '@fortawesome/free-solid-svg-icons/faUnlock';
import {faCrown} from '@fortawesome/free-solid-svg-icons/faCrown';
import {faYoutube} from '@fortawesome/free-brands-svg-icons/faYoutube';
import {faTwitch} from '@fortawesome/free-brands-svg-icons/faTwitch';
import {faLightbulb} from '@fortawesome/free-solid-svg-icons/faLightbulb';
import styles from './Icons.module.css';

const twitchGamingLogo = {
  prefix: 'custom',
  iconName: 'twitch',
  icon: [
    132,
    102,
    [],
    null,
    'M2.68,22.71V89.22s-.25,4.13,5.55,4.13h114.5s4.44.35,4.44-4.21V21.72l-26,27L64.92,13,30,48.7Z',
  ],
};

function BrandedImage({src, alt, brandSrc}) {
  return (
    <div className={styles.brandedImage}>
      <img src={src} alt={alt} className={styles.icon} />
      <img src={brandSrc} alt="" className={styles.brandIcon} />
    </div>
  );
}

export default {
  STAR: <FontAwesomeIcon icon={faStar} />,
  SMILE: <FontAwesomeIcon icon={faSmile} />,
  DOG: <FontAwesomeIcon icon={faDog} className={styles.icon} />,
  THUMBS_UP: <FontAwesomeIcon icon={faThumbsUp} />,
  PEOPLE: <FontAwesomeIcon icon={faSmileWink} />,
  LEAF: <FontAwesomeIcon icon={faLeaf} />,
  ICE_CREAM: <FontAwesomeIcon icon={faIceCream} />,
  BASKET_BALL: <FontAwesomeIcon icon={faBasketballBall} />,
  PLANE: <FontAwesomeIcon icon={faPlane} />,
  BOX: <FontAwesomeIcon icon={faBox} />,
  HEART: <FontAwesomeIcon icon={faHeart} />,
  HEART_BROKEN: <FontAwesomeIcon icon={faHeartBroken} />,
  FLAG: <FontAwesomeIcon icon={faFlag} />,
  CLOCK: <FontAwesomeIcon icon={faClock} />,
  UNLOCK: <FontAwesomeIcon icon={faUnlock} />,
  CROWN: <FontAwesomeIcon icon={faCrown} />,
  BULB: <FontAwesomeIcon icon={faLightbulb} />,
  TWITCH: <FontAwesomeIcon icon={faTwitch} />,
  YOUTUBE: <FontAwesomeIcon icon={faYoutube} />,
  TWITCH_GAMING: <FontAwesomeIcon icon={twitchGamingLogo} />,
  IMAGE: (brandSrc, alt, src = null) =>
    src != null ? (
      <BrandedImage src={src} alt={alt} brandSrc={brandSrc} />
    ) : (
      <img src={brandSrc} alt={alt} className={styles.icon} />
    ),
};
