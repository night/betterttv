import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function DisableWhispers() {
  const [value, setValue] = useStorageState(SettingIds.WHISPERS);

  return (
    <Panel header="Whispers">
      <div className={styles.toggle}>
        <p className={styles.description}>Enable Twitch whispers and show any whispers you receive</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(DisableWhispers, {
  settingId: SettingIds.WHISPERS,
  name: 'Whispers',
  category: CategoryTypes.CHAT,
  keywords: ['whispers', 'direct', 'messages'],
});
