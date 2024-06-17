import * as faSearch from '@fortawesome/free-solid-svg-icons/faSearch';
import {Icon} from '@rsuite/icons';
import React, {useState, useEffect} from 'react';
import AutoComplete from 'rsuite/AutoComplete';
import Button from 'rsuite/Button';
import InputGroup from 'rsuite/InputGroup';
import Panel from 'rsuite/Panel';
import FontAwesomeSvgIcon from '../../../common/components/FontAwesomeSvgIcon.jsx';
import formatMessage from '../../../i18n/index.js';
import extension from '../../../utils/extension.js';
import styles from './Settings.module.css';

const CHROME_VERSION = navigator.userAgentData?.brands?.find(({brand}) => brand === 'Chromium')?.version;
const IS_UNSUPPORTED_CHROME_INSTALL =
  CHROME_VERSION != null ? parseInt(CHROME_VERSION, 10) < 111 && extension.getExtension() != null : false;
const UNSUPPORTED_LEARN_MORE_URL = 'https://github.com/night/betterttv/issues/6860';

if (IS_UNSUPPORTED_CHROME_INSTALL) {
  // eslint-disable-next-line no-console
  console.error(`BTTV: Unsupported Chromium version (v${CHROME_VERSION}). Your browser's Chromium version is not supported. Please upgrade to a version of
  Chromium that is 111 or higher. Learn more at ${UNSUPPORTED_LEARN_MORE_URL}`);
}

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

  if (IS_UNSUPPORTED_CHROME_INSTALL) {
    return (
      <Panel header="Unsupported Chromium Version">
        <p>
          Your browser&apos;s Chromium version (v{CHROME_VERSION}) is not supported. Please upgrade to a version of
          Chromium that is 111 or higher.
        </p>
        <Button href={UNSUPPORTED_LEARN_MORE_URL} appearance="primary" className={styles.unsupportedPanelButton}>
          Learn more
        </Button>
      </Panel>
    );
  }

  return searchedSettings.length === 0 ? (
    <Panel header={formatMessage({defaultMessage: 'No more results...'})} />
  ) : (
    searchedSettings
  );
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
