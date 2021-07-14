import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ClickToPlay() {
  const [value, setValue] = useStorageState(SettingIds.CLICK_TO_PLAY);

  return (
    <Panel header="Click to Play">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables clicking on the Twitch player to pause/resume playback</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(ClickToPlay, {
  settingId: SettingIds.CLICK_TO_PLAY,
  name: 'Click to Play',
  category: CategoryTypes.CHANNEL,
  keywords: ['click', 'play', 'player'],
});
