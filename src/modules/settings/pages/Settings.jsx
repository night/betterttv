import React, {useMemo, useRef, useState} from 'react';
import formatMessage from '../../../i18n/index.js';
import extension from '../../../utils/extension.js';
import PageHeader from '../components/PageHeader.jsx';
import {TextInput, Text, Button, Kbd, CloseButton} from '@mantine/core';
import SettingStore from '../stores/SettingStore.jsx';
import styles from './Settings.module.css';
import Panel from '../components/Panel.jsx';
import {useElementSize, useFocusTrap} from '@mantine/hooks';
import Promotion from '../components/Promotion.jsx';

const CHROME_VERSION = navigator.userAgentData?.brands?.find(({brand}) => brand === 'Chromium')?.version;
const IS_UNSUPPORTED_CHROME_INSTALL =
  CHROME_VERSION != null ? parseInt(CHROME_VERSION, 10) < 111 && extension.getExtension() != null : false;
const UNSUPPORTED_LEARN_MORE_URL = 'https://github.com/night/betterttv/issues/6860';

if (IS_UNSUPPORTED_CHROME_INSTALL) {
  // eslint-disable-next-line no-console
  console.error(
    `BTTV: Unsupported Chromium version (v${CHROME_VERSION}). Your browser's Chromium version is not supported. Please upgrade to a version of Chromium that is 111 or higher. Learn more at ${UNSUPPORTED_LEARN_MORE_URL}`
  );
}

function UnsupportedChromiumVersion() {
  return (
    <Panel title={formatMessage({defaultMessage: 'Unsupported Chromium Version'})}>
      <Text className={styles.unsupportedChromiumVersionText}>
        {formatMessage(
          {defaultMessage: "Your browser's Chromium version (v{CHROME_VERSION}) is not supported. "},
          {CHROME_VERSION}
        )}
      </Text>
      <Text c="dimmed" className={styles.unsupportedChromiumVersionText}>
        {formatMessage({defaultMessage: 'Please upgrade to a version of Chromium that is 111 or higher.'})}
      </Text>
      <Button href={UNSUPPORTED_LEARN_MORE_URL} appearance="primary" className={styles.unsupportedPanelButton}>
        {formatMessage({defaultMessage: 'Learn more'})}
      </Button>
    </Panel>
  );
}

function SettingsList({search, settings, handleSettingRefCallback, pageHeaderHeight}) {
  if (IS_UNSUPPORTED_CHROME_INSTALL) {
    return <UnsupportedChromiumVersion />;
  }

  const searchedSettings = settings
    .filter(
      (setting) =>
        search.length === 0 ||
        setting.keywords.join(' ').includes(search.toLowerCase()) ||
        setting.name.toLowerCase().includes(search.toLowerCase())
    )
    .map((setting) =>
      setting.render({
        ref: (ref) => handleSettingRefCallback(setting.settingPanelId, ref),
        style: {scrollMarginTop: pageHeaderHeight},
      })
    );

  if (searchedSettings.length === 0) {
    return (
      <Panel>
        <Text size="lg" className={styles.noResultsText} c="dimmed">
          {formatMessage({defaultMessage: 'No settings found.'})}
        </Text>
      </Panel>
    );
  }

  return searchedSettings;
}

function Settings({onClose, isInteractive, handleSettingRefCallback}) {
  const {ref, height: pageHeaderHeight} = useElementSize();
  const [search, setSearch] = useState('');
  const inputRef = useFocusTrap(isInteractive);
  const settings = useMemo(() => SettingStore.getSupportedSettings().sort((a, b) => a.name.localeCompare(b.name)), []);

  return (
    <React.Fragment>
      <PageHeader
        ref={ref}
        leftContent={
          <TextInput
            size="lg"
            ref={inputRef}
            value={search}
            placeholder={formatMessage({defaultMessage: 'Search Settings...'})}
            onChange={({target: {value}}) => setSearch(value)}
            classNames={{input: styles.searchInput, root: styles.searchInputRoot}}
            radius="lg"
          />
        }
        onClose={onClose}
      />
      {search.length === 0 ? <Promotion /> : null}
      <SettingsList
        search={search}
        settings={settings}
        handleSettingRefCallback={handleSettingRefCallback}
        pageHeaderHeight={pageHeaderHeight}
      />
    </React.Fragment>
  );
}

export default Settings;
