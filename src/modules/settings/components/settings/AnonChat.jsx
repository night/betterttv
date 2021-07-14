import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function AnonChat() {
  const [value, setValue] = useStorageState(SettingIds.ANON_CHAT);

  return (
    <Panel header="Anon Chat">
      <div className={styles.toggle}>
        <p className={styles.description}>Joins chat anonymously without appearing in the userlist</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AnonChat, {
  settingId: SettingIds.ANON_CHAT,
  name: 'Anon Chat',
  category: CategoryTypes.CHAT,
  keywords: ['anon', 'chat'],
});
