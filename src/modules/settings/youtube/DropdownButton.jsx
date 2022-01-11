import * as faCog from '@fortawesome/free-solid-svg-icons/faCog';
import {Icon} from '@rsuite/icons';
import React from 'react';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import styles from './DropdownButton.module.css';

export default function DropdownButton(props) {
  return (
    <button {...props} className={styles.button} type="button">
      <Icon className={styles.icon} as={FontAwesomeSvgIcon} fontAwesomeIcon={faCog} />
      <div>BetterTTV Settings</div>
    </button>
  );
}
