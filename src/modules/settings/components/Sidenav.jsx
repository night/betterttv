import React from 'react';

import Icon from 'rsuite/lib/Icon/index.js';
import Sidenav from 'rsuite/lib/Sidenav/index.js';
import Nav from 'rsuite/lib/Nav/index.js';

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
          <Nav.Item
            eventKey={PageTypes.CHAT_SETTINGS}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faCommentAlt} />
              </Icon>
            }>
            <p>Chat Settings</p>
          </Nav.Item>
          <Nav.Item
            eventKey={PageTypes.DIRECTORY_SETTINGS}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faCompass} />
              </Icon>
            }>
            <p>Directory Settings</p>
          </Nav.Item>
          <Nav.Item
            eventKey={PageTypes.CHANNEL_SETTINGS}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faHouseUser} />
              </Icon>
            }>
            <p>Channel Settings</p>
          </Nav.Item>
          <Nav.Item
            href="https://betterttv.com/dashboard/emotes"
            target="_blank"
            rel="noreferrer"
            icon={
              <Icon>
                <FontAwesomeIcon icon={faColumns} />
              </Icon>
            }>
            <p>Emote Dashboard</p>
          </Nav.Item>
          <Nav.Item
            eventKey={PageTypes.CHANGELOG}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faBox} />
              </Icon>
            }>
            <p>Changelog</p>
          </Nav.Item>
        </Nav>
        <Nav pullRight className={styles.bottom}>
          <Nav.Item
            eventKey={PageTypes.ABOUT}
            icon={
              <Icon>
                <FontAwesomeIcon icon={faInfoCircle} />
              </Icon>
            }>
            <p>About</p>
          </Nav.Item>
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  );
}

export default BTTVSidenav;
