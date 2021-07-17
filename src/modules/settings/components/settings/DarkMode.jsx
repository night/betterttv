import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

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
