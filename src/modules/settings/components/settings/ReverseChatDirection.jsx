import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ReverseChatDirection() {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <Panel header="Reverse Chat Direction">
      <div className={styles.toggle}>
        <p className={styles.description}>Moves new chat messages to the top of chat</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(ReverseChatDirection, {
  settingId: SettingIds.REVERSE_CHAT_DIRECTION,
  name: 'Chat Direction',
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'direction', 'up', 'down', 'reverse'],
});
