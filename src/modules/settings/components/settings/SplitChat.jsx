import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function SplitChat() {
  const [value, setValue] = useStorageState(SettingIds.SPLIT_CHAT);

  return (
    <Panel header="Split Chat">
      <div className={styles.toggle}>
        <p className={styles.description}>Alternates backgrounds between messages in chat to improve readability</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(SplitChat, {
  settingId: SettingIds.SPLIT_CHAT,
  name: 'Split Chat',
  category: CategoryTypes.CHAT,
  keywords: ['split', 'chat'],
});
