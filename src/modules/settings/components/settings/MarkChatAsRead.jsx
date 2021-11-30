import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function MarkChatAsRead() {
  const [value, setValue] = useStorageState(SettingIds.MARK_CHAT_AS_READ);

  return (
    <Panel header="Mark Chat As Read">
      <div className={styles.toggle}>
        <p className={styles.description}>Double click chat to mark all messages as read</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(MarkChatAsRead, {
  settingId: SettingIds.MARK_CHAT_AS_READ,
  name: 'Mark Chat As Read',
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'mark', 'read'],
});
