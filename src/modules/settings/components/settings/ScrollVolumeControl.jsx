import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function ScrollVolumeControl() {
  const [value, setValue] = useStorageState(SettingIds.SCROLL_VOLUME_CONTROL);

  return (
    <Panel header="Scroll Volume Control">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables scrolling the twitch player to change the player volume</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(ScrollVolumeControl, {
  settingId: SettingIds.SCROLL_VOLUME_CONTROL,
  name: 'Scroll Volume Control',
  category: CategoryTypes.CHAT,
  keywords: ['volume', 'control', 'scroll'],
});
