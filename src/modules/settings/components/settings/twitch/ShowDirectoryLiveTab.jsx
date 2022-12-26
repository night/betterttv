import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function ShowDirectoryLiveTab() {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <Panel header="Show Directory Live Tab">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Defaults to Live tab on the Following page</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ShowDirectoryLiveTab, {
  settingId: SettingIds.SHOW_DIRECTORY_LIVE_TAB,
  name: 'Directory Live Tab',
  category: CategoryTypes.DIRECTORY,
  keywords: ['live', 'tab'],
});
