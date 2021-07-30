import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import {faSmile} from '@fortawesome/free-solid-svg-icons/faSmile';
import cdn from '../../../utils/cdn.js';

export default {
  STAR: () => <FontAwesomeIcon icon={faStar} />,
  SMILE: () => <FontAwesomeIcon icon={faSmile} />,
  BETTERTTV: () => <img alt="BetterTTV Logo" src={cdn.url('/assets/logos/mascot.png')} />,
};
