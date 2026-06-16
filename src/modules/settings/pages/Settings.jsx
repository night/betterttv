import React, {useMemo} from 'react';
import formatMessage from '@/i18n/index';
import extension from '@/utils/extension';
import {Text, Button} from '@mantine/core';
import SettingStore from '@/modules/settings/stores/SettingStore';
import styles from './Settings.module.css';
import Panel from '@/modules/settings/components/Panel';
import Promotion from '@/modules/settings/components/Promotion';
import PageScrollBody from '@/modules/settings/components/PageScrollBody';

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

function SettingsList({search, settings, handleSettingRefCallback}) {
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

function Settings({search, handleSettingRefCallback}) {
  const settings = useMemo(() => SettingStore.getSupportedSettings().sort((a, b) => a.name.localeCompare(b.name)), []);

  return (
    <PageScrollBody>
      {search.length === 0 ? <Promotion /> : null}
      <SettingsList search={search} settings={settings} handleSettingRefCallback={handleSettingRefCallback} />
    </PageScrollBody>
  );
}

export default Settings;
