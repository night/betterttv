import React, {useState} from 'react';
import Setting from '../bttv-components/setting.js';

import Panel from 'rsuite/lib/Panel/index.js';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import AutoComplete from 'rsuite/lib/AutoComplete/index.js';

import enhance from '../../../assets/icons/search-solid.svg';
// import fakeSettings from './settings.json';
import settings from '../../../settings.js';

/*
const categories = [
  <div className='bttv-icon-text' key={0}><p>All Settings</p><Icon icon='chevron-right'/></div>,
  <div className='bttv-icon-text' key={1}><p>UI Settings</p><Icon icon='chevron-right'/></div>,
  <div className='bttv-icon-text' key={2}><p>Chat Settings</p><Icon icon='chevron-right'/></div>,
];
*/

const auto = settings.getSettings().map((setting) => setting.name);

const settingComponents = settings
  .getSettings()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((setting, index) => createSetting(setting, index));

function Settings() {
  const [search, setSearch] = useState('');
  const searchedComponents = settingComponents.filter(
    ({props}) =>
      props.setting.name.toLowerCase().includes(search.toLowerCase()) ||
      props.setting.description.toLowerCase().includes(search.toLowerCase())
  );

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
      <PanelGroup className="bttv-settings-panel">{searchedComponents}</PanelGroup>
    </div>
  );
}

function createSetting(props, index) {
  return (
    <Panel header={props.name} setting={props} eventKey={index} key={index}>
      <Setting setting={props} />
    </Panel>
  );
}

function SearchBar({setSearch}) {
  return (
    <div>
      <InputGroup>
        <AutoComplete data={auto} onChange={(value) => setSearch(value)} />
        <InputGroup.Addon>
          <Icon icon={enhance} />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

export default Settings;
