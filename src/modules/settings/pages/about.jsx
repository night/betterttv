import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Header from '../bttv-components/header.jsx';
import settings from '../../../settings.js';
import storage from '../../../storage.js';
import Button from 'rsuite/lib/Button/index.js';
import IconButton from 'rsuite/lib/IconButton/index.js';
import Input from 'rsuite/lib/Input/index.js';
import {save} from 'save-file';
import download from '../../../assets/icons/download-solid.svg';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import debug from '../../../utils/debug.js';

function backupFile() {
  const rv = storage.getStorage();
  save(JSON.stringify(rv), 'bttv_settings.backup');
}

function resetDefault() {
  for (const setting of settings.getSettings()) {
    settings.set(setting.id, setting.defaultValue);
  }
  setTimeout(() => window.location.reload(), 1000);
}

function isJSON(string) {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
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

function importFile(target) {
  console.log(target);
  getDataURLFromUpload(target, (data) => {
    if (!isJSON(data)) return;

    const settingsToImport = JSON.parse(data);
    Object.keys(settingsToImport).forEach((s) => settings.set(s.split('bttv_')[1], settingsToImport[s]));

    setTimeout(() => window.location.reload(), 1000);
  });
}

function About() {
  return (
    <PanelGroup>
      <Panel>
        <Header heading={'BetterTTV'} description={`Version ${debug.version}`} />
      </Panel>
      <Panel>
        <div className="footer">
          <ul>
            <li>
              <p>EXPLORE</p>
            </li>
            <li>
              <a onClick={() => window.open('https://betterttv.com/')}>Home</a>
            </li>
            <li>
              <a onClick={() => window.open('https://github.com/night/betterttv/issues')}>Report Bugs</a>
            </li>
            <li>
              <a onClick={() => window.open('https://github.com/night/betterttv/issues')}>Submit Ideas</a>
            </li>
            <li>
              <a onClick={() => window.open('https://nightdev.com/')}>Other Products</a>
            </li>
          </ul>
          <ul>
            <li>
              <p>COMMUNITY</p>
            </li>
            <li>
              <a onClick={() => window.open('https://discord.gg/nightdev')}>Discord</a>
            </li>
            <li>
              <a onClick={() => window.open('https://twitter.com/betterttv')}>Twitter</a>
            </li>
            <li>
              <a onClick={() => window.open('https://community.nightdev.com/c/betterttv')}>Forums</a>
            </li>
            <li>
              <a onClick={() => window.open('https://www.nightdev.com/contact')}>Email Us</a>
            </li>
          </ul>
          <ul>
            <li>
              <p>LEGAL</p>
            </li>
            <li>
              <a onClick={() => window.open('https://betterttv.com/terms')}>Terms of Service</a>
            </li>
            <li>
              <a onClick={() => window.open('https://betterttv.com/privacy')}>Privacy Policy</a>
            </li>
          </ul>
        </div>
      </Panel>
      <Panel header="Settings">
        <div className="bttv-settings-backup">
          <IconButton style={{width: '100%'}} appearance="primary" onClick={backupFile} icon={<Icon icon={download} />}>
            Backup Settings
          </IconButton>
          <InputGroup>
            <Input
              type="file"
              className="bttv-settings-upload"
              id="bttv-upload"
              onChange={(_, {target}) => importFile(target)}
            />
            <InputGroup.Addon>Browse</InputGroup.Addon>
          </InputGroup>
          <Button style={{width: '100%'}} color="red" onClick={resetDefault}>
            Reset to Default
          </Button>
        </div>
      </Panel>
    </PanelGroup>
  );
}

export default About;
