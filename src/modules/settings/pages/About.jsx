import React, {useRef, useState} from 'react';
import {saveAs} from 'file-saver';
import classNames from 'classnames';

import IconButton from 'rsuite/IconButton';
import PanelGroup from 'rsuite/PanelGroup';
import Panel from 'rsuite/Panel';
import {Icon} from '@rsuite/icons';
import * as faUpload from '@fortawesome/free-solid-svg-icons/faUpload';
import * as faRedo from '@fortawesome/free-solid-svg-icons/faRedo';
import * as faDownload from '@fortawesome/free-solid-svg-icons/faDownload';
import {SETTINGS_STORAGE_KEY} from '../../../settings.js';
import storage from '../../../storage.js';
import debug from '../../../utils/debug.js';
import {loadLegacySettings} from '../../../utils/legacy-settings.js';
import header from '../styles/header.module.css';
import styles from '../styles/about.module.css';
import CloseButton from '../components/CloseButton.jsx';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import formatMessage from '../../../i18n/index.js';

function loadJSON(string) {
  let json = null;
  try {
    json = JSON.parse(string);
  } catch (e) {
    json = null;
  }
  return json;
}

function getDataURLFromUpload(input) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = ({target}) => resolve(target.result);
    const file = input.files[0];
    if (!file) {
      resolve(null);
      return;
    }
    reader.readAsText(file);
  });
}

function backupFile() {
  const rv = storage.getStorage();
  saveAs(new Blob([JSON.stringify(rv)], {type: 'application/json;charset=utf-8'}), 'bttv_settings.backup');
}

function About({onClose}) {
  const fileImportRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function importFile(target) {
    setImporting(true);

    const data = loadJSON(await getDataURLFromUpload(target));
    if (data == null) {
      return;
    }

    let importLegacy = true;
    const sanitizedData = {};
    for (const key of Object.keys(data)) {
      const nonPrefixedKey = key.split('bttv_')[1];
      storage.set(nonPrefixedKey, data[key]);
      sanitizedData[nonPrefixedKey] = data[key];
      if (nonPrefixedKey === SETTINGS_STORAGE_KEY) {
        importLegacy = false;
      }
    }
    if (importLegacy) {
      storage.set(SETTINGS_STORAGE_KEY, loadLegacySettings(sanitizedData));
    }
    setTimeout(() => window.location.reload(), 1000);
  }

  function resetDefault() {
    setResetting(true);
    storage.set(SETTINGS_STORAGE_KEY, null);
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <>
      <div className={header.content}>
        <PanelGroup>
          <Panel className={styles.largeBlurb}>
            {formatMessage(
              {
                defaultMessage:
                  'Drop a Review on the <chromeReviewLink>Chrome Webstore</chromeReviewLink> or <firefoxReviewLink>Firefox Add-ons</firefoxReviewLink> site or maybe even Subscribe to <proLink>BetterTTV Pro</proLink>!',
              },
              {
                // eslint-disable-next-line react/no-unstable-nested-components
                chromeReviewLink: (children) => (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://chrome.google.com/webstore/detail/betterttv/ajopnjidmegmdimjlfnijceegpefgped">
                    {children}
                  </a>
                ),
                // eslint-disable-next-line react/no-unstable-nested-components
                firefoxReviewLink: (children) => (
                  <a target="_blank" rel="noreferrer" href="https://addons.mozilla.org/firefox/addon/betterttv/">
                    {children}
                  </a>
                ),
                // eslint-disable-next-line react/no-unstable-nested-components
                proLink: (children) => (
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/dashboard/pro">
                    {children}
                  </a>
                ),
              }
            )}
          </Panel>
          <Panel>
            <div className={styles.socials}>
              <ul>
                <li>
                  <p className={classNames(header.heading, header.upper)}>
                    {formatMessage({defaultMessage: 'Explore'})}
                  </p>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/">
                    {formatMessage({defaultMessage: 'Home'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://github.com/night/betterttv/issues">
                    {formatMessage({defaultMessage: 'Report Bugs'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://github.com/night/betterttv/issues">
                    {formatMessage({defaultMessage: 'Submit Ideas'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://nightdev.com/">
                    {formatMessage({defaultMessage: 'Other Products'})}
                  </a>
                </li>
              </ul>
              <ul>
                <li>
                  <p className={classNames(header.heading, header.upper)}>
                    {formatMessage({defaultMessage: 'Community'})}
                  </p>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://discord.gg/nightdev">
                    {formatMessage({defaultMessage: 'Discord'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://twitter.com/betterttv">
                    {formatMessage({defaultMessage: 'Twitter'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://community.nightdev.com/c/betterttv">
                    {formatMessage({defaultMessage: 'Forums'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://www.nightdev.com/contact">
                    {formatMessage({defaultMessage: 'Email Us'})}
                  </a>
                </li>
              </ul>
              <ul>
                <li>
                  <p className={classNames(header.heading, header.upper)}>{formatMessage({defaultMessage: 'Legal'})}</p>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/terms">
                    {formatMessage({defaultMessage: 'Terms of Service'})}
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/privacy">
                    {formatMessage({defaultMessage: 'Privacy Policy'})}
                  </a>
                </li>
              </ul>
            </div>
          </Panel>
          <Panel header={formatMessage({defaultMessage: 'Settings'})}>
            <div className={styles.buttons}>
              <IconButton
                className={styles.button}
                appearance="primary"
                onClick={backupFile}
                disabled={resetting}
                icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faDownload} />}>
                {formatMessage({defaultMessage: 'Backup Settings'})}
              </IconButton>
              <input type="file" hidden ref={fileImportRef} onChange={({target}) => importFile(target)} />
              <IconButton
                className={styles.button}
                appearance="primary"
                onClick={() => {
                  const currentFileImportRef = fileImportRef.current;
                  if (currentFileImportRef == null) {
                    return;
                  }
                  currentFileImportRef.click();
                }}
                disabled={resetting}
                loading={importing}
                icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faUpload} />}>
                {formatMessage({defaultMessage: 'Import Settings'})}
              </IconButton>
              <IconButton
                icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faRedo} />}
                className={styles.button}
                loading={resetting}
                disabled={importing}
                color="red"
                onClick={() => resetDefault()}>
                {formatMessage({defaultMessage: 'Reset to Default'})}
              </IconButton>
            </div>
          </Panel>
          <Panel>
            <p className={header.description}>
              {formatMessage({defaultMessage: 'Version {version}'}, {version: debug.version})}
            </p>
          </Panel>
        </PanelGroup>
      </div>
      <div className={header.header}>
        <CloseButton onClose={onClose} className={header.closeButton} />
      </div>
    </>
  );
}

export default About;
