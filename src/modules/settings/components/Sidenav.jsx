import * as faBox from '@fortawesome/free-solid-svg-icons/faBox';
import * as faColumns from '@fortawesome/free-solid-svg-icons/faColumns';
import * as faCommentAlt from '@fortawesome/free-solid-svg-icons/faCommentAlt';
import * as faCompass from '@fortawesome/free-solid-svg-icons/faCompass';
import * as faHouseUser from '@fortawesome/free-solid-svg-icons/faHouseUser';
import * as faInfoCircle from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {Icon} from '@rsuite/icons';
import React from 'react';
import Nav from 'rsuite/Nav';
import Sidenav from 'rsuite/Sidenav';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import {PageTypes} from '../../../constants.js';
import formatMessage from '../../../i18n/index.js';
import styles from '../styles/sidenav.module.css';
import AnimatedLogo from './AnimatedLogo.jsx';

function BTTVSidenav({value, onChange}) {
  return (
    <Sidenav className={styles.sidenav} expanded={false}>
      <Sidenav.Body className={styles.body}>
        <div>
          <AnimatedLogo />
          <Nav activeKey={value} onSelect={onChange} className={styles.nav}>
            <Nav.Item
              eventKey={PageTypes.CHAT_SETTINGS}
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faCommentAlt} />}>
              <p>{formatMessage({defaultMessage: 'Chat Settings'})}</p>
            </Nav.Item>
            <Nav.Item
              eventKey={PageTypes.DIRECTORY_SETTINGS}
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faCompass} />}>
              <p>{formatMessage({defaultMessage: 'Directory Settings'})}</p>
            </Nav.Item>
            <Nav.Item
              eventKey={PageTypes.CHANNEL_SETTINGS}
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faHouseUser} />}>
              <p>{formatMessage({defaultMessage: 'Channel Settings'})}</p>
            </Nav.Item>
            <Nav.Item
              href="https://betterttv.com/dashboard/emotes"
              target="_blank"
              rel="noreferrer"
              icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faColumns} />}>
              <p>{formatMessage({defaultMessage: 'Emote Dashboard'})}</p>
            </Nav.Item>
            <Nav.Item eventKey={PageTypes.CHANGELOG} icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faBox} />}>
              <p>{formatMessage({defaultMessage: 'Changelog'})}</p>
            </Nav.Item>
          </Nav>
        </div>
        <Nav pullRight activeKey={value} onSelect={onChange}>
          <Nav.Item eventKey={PageTypes.ABOUT} icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faInfoCircle} />}>
            <p>{formatMessage({defaultMessage: 'About'})}</p>
          </Nav.Item>
        </Nav>
      </Sidenav.Body>
    </Sidenav>
  );
}

export default BTTVSidenav;
