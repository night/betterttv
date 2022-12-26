import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function ScrollVolumeControl() {
  const [value, setValue] = useStorageState(SettingIds.SCROLL_PLAYER_CONTROLS);

  return (
    <Panel header="Scroll Player Controls">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          Enable scrolling the Twitch player to change the player volume. Hold ALT when scrolling to seek.
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ScrollVolumeControl, {
  settingId: SettingIds.SCROLL_PLAYER_CONTROLS,
  name: 'Scroll Player Controls',
  category: CategoryTypes.CHANNEL,
  keywords: ['volume', 'seek', 'control', 'scroll'],
});
