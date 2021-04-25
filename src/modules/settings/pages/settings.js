import React, {useEffect, useState} from 'react';
import Setting from '../bttv-components/setting.js';

import Panel from 'rsuite/lib/Panel/index.js';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import AutoComplete from 'rsuite/lib/AutoComplete/index.js';
import Divider from 'rsuite/lib/Divider/index.js';

import enhance from '../../../assets/icons/search-solid.svg';
import _settings from '../../../settings.js';
// import fakeSettings from './settings.json';

const auto = _settings.getSettings().map((setting) => setting.name);

function Settings({header, category}) {
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    setSettings(
      _settings
        .getSettings()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((setting, index) => createSetting(setting, index))
    );
  }, []);

  const searchedSettings =
    search.length > 0
      ? settings.filter(
          ({props}) =>
            props.setting.name.toLowerCase().includes(search.toLowerCase()) ||
            props.setting.description.toLowerCase().includes(search.toLowerCase())
        )
      : settings.filter(({props}) => props.setting.category === category);

  return (
    <div>
      <Panel>
        <h4>{header} Settings</h4>
        <p>Here you can enhance your experience on Twitch with our wide range of settings.</p>
        <br />
        <SearchBar setSearch={setSearch} />
      </Panel>
      {searchedSettings.length > 0 && searchedSettings}
    </div>
  );
}

function createSetting(props, index) {
  return (
    <Panel setting={props} eventKey={index} key={index}>
      <Divider />
      <h4>{props.name}</h4>
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
