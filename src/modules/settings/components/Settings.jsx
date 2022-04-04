import React, {useState, useEffect} from 'react';
import Panel from 'rsuite/Panel';
import {Icon} from '@rsuite/icons';
import InputGroup from 'rsuite/InputGroup';
import AutoComplete from 'rsuite/AutoComplete';
import * as faSearch from '@fortawesome/free-solid-svg-icons/faSearch';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';

let cachedSettings = null;

async function loadSettings() {
  if (cachedSettings != null) {
    return cachedSettings;
  }

  const {Components} = await import('./Store.jsx');
  cachedSettings = Object.values(Components).sort((a, b) => a.name.localeCompare(b.name));

  return cachedSettings;
}

function useSettingsState() {
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  return settings;
}

export function Settings({search, category}) {
  const settings = useSettingsState();

  const searchedSettings =
    search.length === 0
      ? settings.filter((setting) => setting.category === category).map((setting) => setting.render())
      : settings
          .filter(
            (setting) =>
              setting.keywords.join(' ').includes(search.toLowerCase()) ||
              setting.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((setting) => setting.render());

  return searchedSettings.length === 0 ? <Panel header="No more results..." /> : searchedSettings;
}

export function Search(props) {
  const {value, onChange, placeholder, ...restProps} = props;
  const settings = useSettingsState();

  const auto = settings
    .filter((setting) => setting.keywords.join(' ').includes(value.toLowerCase()))
    .map((setting) => setting.name)
    .splice(0, 5);

  return (
    <InputGroup {...restProps}>
      <AutoComplete
        value={value}
        data={auto}
        filterBy={() => true}
        onChange={(newValue) => onChange(newValue)}
        placeholder={placeholder}
      />
      <InputGroup.Addon>
        <Icon as={FontAwesomeSvgIcon} fontAwesomeIcon={faSearch} />
      </InputGroup.Addon>
    </InputGroup>
  );
}
