import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function DisableWhispers() {
  const [value, setValue] = useStorageState(SettingIds.WHISPERS);

  return (
    <Panel header="Whispers">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Enable Twitch whispers and show any whispers you receive</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(DisableWhispers, {
  settingId: SettingIds.WHISPERS,
  name: 'Whispers',
  category: CategoryTypes.CHAT,
  keywords: ['whispers', 'direct', 'messages'],
});
