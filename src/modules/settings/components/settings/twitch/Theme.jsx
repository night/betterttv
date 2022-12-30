import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

function Theme() {
  const [darkThemeValue, setDarkThemeValue] = useStorageState(SettingIds.DARKENED_MODE);
  const [autoThemeValue, setAutoThemeValue] = useStorageState(SettingIds.AUTO_THEME_MODE);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Dark theme'})}</p>
        <Toggle checked={darkThemeValue} onChange={(state) => setDarkThemeValue(state)} disabled={autoThemeValue} />
      </div>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Automatically set dark theme from your system&apos;s theme'})}
        </p>
        <Toggle checked={autoThemeValue} onChange={(state) => setAutoThemeValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(Theme, {
  settingId: SettingIds.DARKENED_MODE,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['dark', 'mode', 'light', 'theme', 'white', 'black'],
});
