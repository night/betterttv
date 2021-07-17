import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ShowDirectoryLiveTab() {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <Panel header="Show Directory Live Tab">
      <div className={styles.toggle}>
        <p className={styles.description}>Defaults to Live tab on the Following page</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(ShowDirectoryLiveTab, {
  settingId: SettingIds.SHOW_DIRECTORY_LIVE_TAB,
  name: 'Directory Live Tab',
  category: CategoryTypes.DIRECTORY,
  keywords: ['live', 'tab'],
});
