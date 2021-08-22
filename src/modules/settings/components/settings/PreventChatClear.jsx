import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ClearChatBehavior() {
  const [value, setValue] = useStorageState(SettingIds.CLEAR_BEHAVIOR);

  return (
    <Panel header="Chat Clear Behavior">
      <div className={styles.toggle}>
        <p className={styles.description}>Prevents Chat from being cleared (Default: Off)</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(ClearChatBehavior, {
  settingId: SettingIds.CLEAR_BEHAVIOR,
  name: 'Clear Command Behavior',
  category: CategoryTypes.CHAT,
  keywords: ['clear', 'chat'],
});
