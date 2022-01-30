import React, {useRef, useState} from 'react';
import {saveAs} from 'file-saver';

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
                  <p className={header.heading}>EXPLORE</p>
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
                  <p className={header.heading}>COMMUNITY</p>
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
                  <p className={header.heading}>LEGAL</p>
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
                icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faDownload} />}>
                Backup Settings
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
                Import Settings
              </IconButton>
              <IconButton
                icon={<Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faRedo} />}
                className={styles.button}
                loading={resetting}
                disabled={importing}
                color="red"
                onClick={() => resetDefault()}>
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
        <CloseButton onClose={onClose} className={header.closeButton} />
      </div>
    </>
  );
}

export default About;
