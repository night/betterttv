import React, {useRef, useState} from 'react';
import {save} from 'save-file';

import IconButton from 'rsuite/lib/IconButton/index.js';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import Panel from 'rsuite/lib/Panel/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import {faUpload} from '@fortawesome/free-solid-svg-icons/faUpload';
import {faRedo} from '@fortawesome/free-solid-svg-icons/faRedo';
import {faDownload} from '@fortawesome/free-solid-svg-icons/faDownload';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import settings from '../../../settings.js';
import storage from '../../../storage.js';
import debug from '../../../utils/debug.js';
import header from '../styles/header.module.css';
import styles from '../styles/about.module.css';
import {DefaultValues, SettingIds} from '../../../constants.js';
import CloseButton from '../components/CloseButton.jsx';

function isJSON(string) {
  let json = null;
  try {
    json = JSON.parse(string);
  } catch (e) {
    json = null;
  }
  return json;
}

function getDataURLFromUpload(input, callback) {
  const reader = new FileReader();
  reader.onload = ({target}) => callback(target.result);
  const file = input.files[0];
  if (!file) {
    callback(null);
    return;
  }
  reader.readAsText(file);
}

function backupFile() {
  const rv = storage.getStorage();
  save(JSON.stringify(rv), 'bttv_settings.backup');
}

function About({onHide}) {
  const fileImport = useRef(null);
  const [importing, setImporting] = useState(false);
  const [resetting, setResetting] = useState(false);

  function importFile(target) {
    setImporting(true);

    getDataURLFromUpload(target, (data) => {
      const settingsToImport = isJSON(data);
      const keysToImport = Object.keys(settingsToImport);
      let importLegacy = true;
      for (const key of keysToImport) {
        const nonPrefixedKey = key.split('bttv_')[1];
        storage.set(nonPrefixedKey, settingsToImport[key]);
        if (nonPrefixedKey === 'settings') {
          importLegacy = false;
        }
      }
      if (importLegacy) {
        settings.importLegacySettings();
      }
      setTimeout(() => window.location.reload(), 1000);
    });
  }

  function resetDefault() {
    setResetting(true);

    for (const id of Object.values(SettingIds)) {
      settings.set(id, DefaultValues[id]);
    }
    setTimeout(() => window.location.reload(), 1000);
  }

  return (
    <>
      <div className={header.content}>
        <PanelGroup>
          <Panel className={styles.largeBlurb}>
            Drop a Review on the{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://chrome.google.com/webstore/detail/betterttv/ajopnjidmegmdimjlfnijceegpefgped">
              Chrome Webstore
            </a>{' '}
            or{' '}
            <a target="_blank" rel="noreferrer" href="https://addons.mozilla.org/firefox/addon/betterttv/">
              Firefox Add-ons
            </a>{' '}
            site or maybe even Subscribe to{' '}
            <a target="_blank" rel="noreferrer" href="https://betterttv.com/dashboard/pro">
              BetterTTV Pro
            </a>
            !
          </Panel>
          <Panel>
            <div className={styles.socials}>
              <ul>
                <li>
                  <p>EXPLORE</p>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/">
                    Home
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://github.com/night/betterttv/issues">
                    Report Bugs
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://github.com/night/betterttv/issues">
                    Submit Ideas
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://nightdev.com/">
                    Other Products
                  </a>
                </li>
              </ul>
              <ul>
                <li>
                  <p>COMMUNITY</p>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://discord.gg/nightdev">
                    Discord
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://twitter.com/betterttv">
                    Twitter
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://community.nightdev.com/c/betterttv">
                    Forums
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://www.nightdev.com/contact">
                    Email Us
                  </a>
                </li>
              </ul>
              <ul>
                <li>
                  <p>LEGAL</p>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/terms">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a target="_blank" rel="noreferrer" href="https://betterttv.com/privacy">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </Panel>
          <Panel header="Settings">
            <div className={styles.buttons}>
              <IconButton
                className={styles.button}
                appearance="primary"
                onClick={backupFile}
                disabled={resetting}
                icon={
                  <Icon>
                    <FontAwesomeIcon icon={faDownload} />
                  </Icon>
                }>
                Backup Settings
              </IconButton>
              <input type="file" hidden ref={fileImport} onChange={({target}) => importFile(target)} />
              <IconButton
                className={styles.button}
                appearance="primary"
                onClick={() => fileImport.current.click()}
                disabled={resetting}
                loading={importing}
                icon={
                  <Icon>
                    <FontAwesomeIcon icon={faUpload} />
                  </Icon>
                }>
                Import Settings
              </IconButton>
              <IconButton
                icon={
                  <Icon>
                    <FontAwesomeIcon icon={faRedo} />
                  </Icon>
                }
                className={styles.button}
                loading={resetting}
                disabled={importing}
                color="red"
                onClick={resetDefault}>
                Reset to Default
              </IconButton>
            </div>
          </Panel>
          <Panel>
            <p className={header.description}>{`Version ${debug.version}`}</p>
          </Panel>
        </PanelGroup>
      </div>
      <div className={header.header}>
        <CloseButton onHide={onHide} className={header.closeButton} />
      </div>
    </>
  );
}

export default About;
