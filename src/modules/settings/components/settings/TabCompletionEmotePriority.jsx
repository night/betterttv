import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function TabCompletionEmotePriority() {
  const [value, setValue] = useStorageState(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY);

  return (
    <Panel header="Tab Completion Emote Priority">
      <div className={styles.toggle}>
        <p className={styles.description}>Prioritizes emotes over usernames when using tab completion</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(TabCompletionEmotePriority, {
  settingId: SettingIds.TAB_COMPLETION_EMOTE_PRIORITY,
  name: 'Tab Completion Emote Priority',
  category: CategoryTypes.CHAT,
  keywords: ['tab', 'completion', 'emote', 'priority'],
});
