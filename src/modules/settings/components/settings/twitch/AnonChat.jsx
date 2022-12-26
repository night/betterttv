import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function AnonChat() {
  const [value, setValue] = useStorageState(SettingIds.ANON_CHAT);

  return (
    <Panel header="Anon Chat">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Joins chat anonymously without appearing in the userlist</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(AnonChat, {
  settingId: SettingIds.ANON_CHAT,
  name: 'Anon Chat',
  category: CategoryTypes.CHAT,
  keywords: ['anon', 'chat'],
});
