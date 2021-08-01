import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faStar} from '@fortawesome/free-solid-svg-icons/faStar';
import {faSmile} from '@fortawesome/free-solid-svg-icons/faSmile';
import {faDog} from '@fortawesome/free-solid-svg-icons/faDog';
import {faThumbsUp} from '@fortawesome/free-solid-svg-icons/faThumbsUp';

export default {
  STAR: () => <FontAwesomeIcon icon={faStar} />,
  SMILE: () => <FontAwesomeIcon icon={faSmile} />,
  DOG: () => <FontAwesomeIcon icon={faDog} />,
  THUMBS_UP: () => <FontAwesomeIcon icon={faThumbsUp} />,
};
