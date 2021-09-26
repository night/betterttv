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
import styles from '../styles/icons.module.css';

const twitchLogo = {
  prefix: 'custom',
  iconName: 'twitch',
  icon: [
    512,
    422,
    [],
    null,
    'M391.17,103.47H352.54v109.7h38.63ZM285,103H246.37V212.75H285ZM120.83,0,24.31,91.42V420.58H140.14V512l96.53-91.42h77.25L487.69,256V0ZM449.07,237.75l-77.22,73.12H294.61l-67.6,64v-64H140.14V36.58H449.07Z',
  ],
};

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

const youtubeLogo = {
  prefix: 'custom',
  iconName: 'youtube',
  icon: [
    475,
    475,
    [],
    null,
    'M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z',
  ],
};

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
  TWITCH: <FontAwesomeIcon icon={twitchLogo} />,
  TWITCH_GAMING: <FontAwesomeIcon icon={twitchGamingLogo} />,
  YOUTUBE: <FontAwesomeIcon icon={youtubeLogo} />,
  IMAGE: (src, alt) => <img src={src} alt={alt} className={styles.icon} />,
};
