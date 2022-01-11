import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import useStorageState from '../../../../common/hooks/StorageState.jsx';

function ReverseChatDirection() {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <Panel header="Reverse Chat Direction">
      <div className={styles.toggle}>
        <p>Moves new chat messages to the top of chat</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

loadModuleForPlatforms([
  PlatformTypes.TWITCH,
  () =>
    registerComponent(ReverseChatDirection, {
      settingId: SettingIds.REVERSE_CHAT_DIRECTION,
      name: 'Chat Direction',
      category: CategoryTypes.CHAT,
      keywords: ['chat', 'direction', 'up', 'down', 'reverse'],
    }),
]);
