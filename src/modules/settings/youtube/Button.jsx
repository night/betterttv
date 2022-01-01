import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import styles from './Button.module.css';

export default function Button(props) {
  return <FontAwesomeIcon icon={faCog} className={styles.button} {...props} />;
}
