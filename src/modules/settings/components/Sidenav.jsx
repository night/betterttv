import React from 'react';

import Sidenav from 'rsuite/Sidenav';
import Nav from 'rsuite/Nav';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBox} from '@fortawesome/free-solid-svg-icons/faBox';
import {faHouseUser} from '@fortawesome/free-solid-svg-icons/faHouseUser';
import {faCompass} from '@fortawesome/free-solid-svg-icons/faCompass';
import {faColumns} from '@fortawesome/free-solid-svg-icons/faColumns';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {faCommentAlt} from '@fortawesome/free-solid-svg-icons/faCommentAlt';

import cdn from '../../../utils/cdn.js';
import styles from '../styles/sidenav.module.css';
import {PageTypes} from '../../../constants.js';

function BTTVSidenav({value, onChange}) {
  return (
    <Sidenav className={styles.sidenav} activeKey={value} onSelect={onChange} expanded={false}>
      <Sidenav.Body>
        <img alt="BetterTTV Logo" src={cdn.url('/assets/logos/mascot.png')} className={styles.logo} />
        <Nav className={styles.nav}>
          <Nav.Item eventKey={PageTypes.CHAT_SETTINGS} icon={<FontAwesomeIcon icon={faCommentAlt} />}>
            <p>Chat Settings</p>
          </Nav.Item>
          <Nav.Item eventKey={PageTypes.DIRECTORY_SETTINGS} icon={<FontAwesomeIcon icon={faCompass} />}>
            <p>Directory Settings</p>
          </Nav.Item>
          <Nav.Item eventKey={PageTypes.CHANNEL_SETTINGS} icon={<FontAwesomeIcon icon={faHouseUser} />}>
            <p>Channel Settings</p>
          </Nav.Item>
          <Nav.Item
            href="https://betterttv.com/dashboard/emotes"
            target="_blank"
            rel="noreferrer"
            icon={<FontAwesomeIcon icon={faColumns} />}>
            <p>Emote Dashboard</p>
          </Nav.Item>
          <Nav.Item eventKey={PageTypes.CHANGELOG} icon={<FontAwesomeIcon icon={faBox} />}>
            <p>Changelog</p>
          </Nav.Item>
        </Nav>
        <Nav pullRight className={styles.bottom}>
          <Nav.Item eventKey={PageTypes.ABOUT} icon={<FontAwesomeIcon icon={faInfoCircle} />}>
            <p>About</p>
          </Nav.Item>
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  );
}

export default BTTVSidenav;
