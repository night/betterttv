import React from 'react';
// eslint-disable-next-line import/extensions, import/no-unresolved
import './settings/*';
import Panel from 'rsuite/lib/Panel/index.js';
import Icon from 'rsuite/lib/Icon/index.js';
import InputGroup from 'rsuite/lib/InputGroup/index.js';
import AutoComplete from 'rsuite/lib/AutoComplete/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons/faSearch';

import {Components} from './Store.jsx';

const settings = Object.values(Components).sort((a, b) => a.name.localeCompare(b.name));

export function Settings({search, category}) {
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
        <Icon>
          <FontAwesomeIcon icon={faSearch} />
        </Icon>
      </InputGroup.Addon>
    </InputGroup>
  );
}
