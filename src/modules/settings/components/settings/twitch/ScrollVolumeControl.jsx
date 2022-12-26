import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function ScrollVolumeControl() {
  const [value, setValue] = useStorageState(SettingIds.SCROLL_VOLUME_CONTROL);

  return (
    <Panel header="Scroll Volume Control">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Enables scrolling the twitch player to change the player volume</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ScrollVolumeControl, {
  settingId: SettingIds.SCROLL_VOLUME_CONTROL,
  name: 'Scroll Volume Control',
  category: CategoryTypes.CHAT,
  keywords: ['volume', 'control', 'scroll'],
});
