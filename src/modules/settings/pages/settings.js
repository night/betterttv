import React, {useState} from 'react';
import Setting from '../bttv-components/setting.js';

import Panel from 'rsuite/lib/Panel/index.js';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import AutoComplete from 'rsuite/lib/AutoComplete/index.js';

import settings from './settings.json';

/*
const categories = [
  <div className='bttv-icon-text' key={0}><p>All Settings</p><Icon icon='chevron-right'/></div>,
  <div className='bttv-icon-text' key={1}><p>UI Settings</p><Icon icon='chevron-right'/></div>,
  <div className='bttv-icon-text' key={2}><p>Chat Settings</p><Icon icon='chevron-right'/></div>,
];
*/

const auto = settings.map((setting) => setting.name);

function Settings() {
  const [, setSearch] = useState('');
  const settingsData = settings.map((setting, index) => createSetting(setting, index));

  return (
    <div className="bttv-settings-page">
      <Panel>
        <div>
          <h4>Settings</h4>
          <p>Think this addon is awesome?</p>
        </div>
        <br />
        <SearchBar setSearch={setSearch} />
      </Panel>
      <PanelGroup className="bttv-settings-panel">{settingsData}</PanelGroup>
    </div>
  );
}

function createSetting(props, index) {
  return (
    <Panel header={props.name} eventKey={index}>
      <Setting props={props} />
    </Panel>
  );
}

function SearchBar({setSearch}) {
  return (
    <div>
      <InputGroup>
        <AutoComplete data={auto} onChange={(value) => setSearch(value)} />
        <InputGroup.Addon>
          <Icon icon="search" />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

export default Settings;
