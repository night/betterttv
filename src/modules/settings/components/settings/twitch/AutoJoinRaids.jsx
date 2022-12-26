import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function AutoJoinRaids() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_JOIN_RAIDS);

  return (
    <Panel header="Auto Join Raids">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Join raids automatically</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AutoJoinRaids, {
  settingId: SettingIds.AUTO_JOIN_RAIDS,
  name: 'Auto Join Raids',
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'join', 'raids'],
});
