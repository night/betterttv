import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ClickTwitchEmotes() {
  const [value, setValue] = useStorageState(SettingIds.CLICK_TWITCH_EMOTES);

  return (
    <Panel header="Emote Menu">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables a more advanced emote menu for Twitch (made by Ryan Chatham)</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(ClickTwitchEmotes, {
  settingId: SettingIds.CLICK_TWITCH_EMOTES,
  name: 'Emote Menu',
  category: CategoryTypes.CHAT,
  keywords: ['twitch', 'emotes', 'popup'],
});
