import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import useStorageState from '../../../../common/hooks/StorageState.jsx';

function DarkMode() {
  const [value, setValue] = useStorageState(SettingIds.DARKENED_MODE);

  return (
    <Panel header="Dark Mode">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables dark theme</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(DarkMode, {
  settingId: SettingIds.DARKENED_MODE,
  name: 'Dark Mode',
  category: CategoryTypes.CHANNEL,
  keywords: ['dark', 'mode', 'light', 'theme', 'white', 'black'],
});
