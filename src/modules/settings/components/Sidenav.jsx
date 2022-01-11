import React from 'react';

import {Icon} from '@rsuite/icons';
import Sidenav from 'rsuite/Sidenav';
import Nav from 'rsuite/Nav';

import * as faBox from '@fortawesome/free-solid-svg-icons/faBox';
import * as faHouseUser from '@fortawesome/free-solid-svg-icons/faHouseUser';
import * as faCompass from '@fortawesome/free-solid-svg-icons/faCompass';
import * as faColumns from '@fortawesome/free-solid-svg-icons/faColumns';
import * as faInfoCircle from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import * as faCommentAlt from '@fortawesome/free-solid-svg-icons/faCommentAlt';

import cdn from '../../../utils/cdn.js';
import styles from '../styles/sidenav.module.css';
import {PageTypes} from '../../../constants.js';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';

function BTTVSidenav({value, onChange}) {
  return (
    <Sidenav className={styles.sidenav} expanded={false}>
      <Sidenav.Body className={styles.body}>
        <div>
          <img alt="BetterTTV Logo" src={cdn.url('/assets/logos/mascot.png')} className={styles.logo} />
          <Nav activeKey={value} onSelect={onChange} className={styles.nav}>
            <Nav.Item
              eventKey={PageTypes.CHAT_SETTINGS}
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faCommentAlt} />}>
              <p>Chat Settings</p>
            </Nav.Item>
            <Nav.Item
              eventKey={PageTypes.DIRECTORY_SETTINGS}
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faCompass} />}>
              <p>Directory Settings</p>
            </Nav.Item>
            <Nav.Item
              eventKey={PageTypes.CHANNEL_SETTINGS}
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faHouseUser} />}>
              <p>Channel Settings</p>
            </Nav.Item>
            <Nav.Item
              href="https://betterttv.com/dashboard/emotes"
              target="_blank"
              rel="noreferrer"
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faColumns} />}>
              <p>Emote Dashboard</p>
            </Nav.Item>
            <Nav.Item eventKey={PageTypes.CHANGELOG} icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faBox} />}>
              <p>Changelog</p>
            </Nav.Item>
          </Nav>
        </div>
        <Nav pullRight activeKey={value} onSelect={onChange}>
          <Nav.Item eventKey={PageTypes.ABOUT} icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faInfoCircle} />}>
            <p>About</p>
          </Nav.Item>
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  );
}

export default BTTVSidenav;
