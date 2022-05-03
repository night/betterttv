import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function AutoTheme() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_THEME_MODE);

  return (
    <Panel header="Auto Theme Mode">
      <div className={styles.toggle}>
        <p className={styles.description}>Automatically sets Twitch&apos;s theme to match the system&apos;s theme</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AutoTheme, {
  settingId: SettingIds.AUTO_THEME_MODE,
  name: 'Auto Theme Mode',
  category: CategoryTypes.CHANNEL,
  keywords: ['dark', 'mode', 'light', 'theme', 'white', 'black', 'auto'],
});
