import React, {useEffect, useState} from 'react';
import enhance from '../../../assets/icons/search-solid.svg';
import _settings from '../../../settings.js';
import bake from '../bttv-components/bake.js';

import Setting from '../bttv-components/setting.jsx';
import Header from '../bttv-components/header.jsx';
import Panel from 'rsuite/lib/Panel/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import AutoComplete from 'rsuite/lib/AutoComplete/index.js';
import PanelGroup from 'rsuite/lib/PanelGroup/index.js';

const auto = _settings.getSettings().map((setting) => setting.name);

function Settings({header, category}) {
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    setSearch('');
  }, [category]);

  useEffect(() => {
    setSettings(
      bake(_settings.getSettings())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((setting, index) => createSetting(setting, index))
    );
  }, []);

  const searchedSettings =
    search.length > 0
      ? settings.filter(
          ({props}) =>
            props.setting.name.toLowerCase().includes(search.toLowerCase()) ||
            props.setting.description.toLowerCase().includes(search.toLowerCase()) ||
            JSON.stringify(props.setting.options).toLowerCase().includes(search.toLowerCase())
        )
      : settings.filter(({props}) => props.setting.category === category);

  return (
    <PanelGroup>
      <Panel>
        <Header
          heading={header}
          description={'Here you can enhance your experience on Twitch with our wide range of settings.'}
        />
        <br />
        <SearchBar search={search} setSearch={setSearch} />
      </Panel>
      {searchedSettings.length > 0 ? searchedSettings : <Panel>No results</Panel>}
    </PanelGroup>
  );
}

function createSetting(setting, index) {
  return (
    <Panel header={setting.name} setting={setting} eventKey={index} key={index}>
      <Setting setting={setting} />
    </Panel>
  );
}

function SearchBar({search, setSearch}) {
  return (
    <div>
      <InputGroup>
        <AutoComplete value={search} data={auto} onChange={(value) => setSearch(value)} />
        <InputGroup.Addon>
          <Icon icon={enhance} />
        </InputGroup.Addon>
      </InputGroup>
    </div>
  );
}

export default Settings;
