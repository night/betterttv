import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function EmoteMenu() {
  const [emoteMenuValue, setEmoteMenuValue] = useStorageState(SettingIds.EMOTE_MENU);

  return (
    <Panel header="Emote Menu">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables a more advanced emote menu for Twitch</p>
        <Toggle checked={emoteMenuValue} onChange={(state) => setEmoteMenuValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(EmoteMenu, {
  settingId: SettingIds.EMOTE_MENU,
  name: 'Emote Menu',
  category: CategoryTypes.CHAT,
  keywords: ['twitch', 'emotes', 'popup'],
});
