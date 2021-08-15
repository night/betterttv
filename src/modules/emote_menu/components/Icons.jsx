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
import {faFlag} from '@fortawesome/free-solid-svg-icons/faFlag';
import {faClock} from '@fortawesome/free-solid-svg-icons/faClock';
import {faUnlock} from '@fortawesome/free-solid-svg-icons/faUnlock';
import {faCrown} from '@fortawesome/free-solid-svg-icons/faCrown';
import styles from '../styles/icons.module.css';

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
  FLAG: <FontAwesomeIcon icon={faFlag} />,
  CLOCK: <FontAwesomeIcon icon={faClock} />,
  UNLOCK: <FontAwesomeIcon icon={faUnlock} />,
  CROWN: <FontAwesomeIcon icon={faCrown} />,
  IMAGE: (src, alt) => <img src={src} alt={alt} className={styles.icon} />,
};
