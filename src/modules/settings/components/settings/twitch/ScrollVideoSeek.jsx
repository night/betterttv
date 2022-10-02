import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function ScrollVideoSeek() {
  const [value, setValue] = useStorageState(SettingIds.SCROLL_VIDEO_SEEK);

  return (
    <Panel header="Seek by Scrolling">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables alt+scrolling on the Twitch player to seek through VODs</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ScrollVideoSeek, {
  settingId: SettingIds.SCROLL_VIDEO_SEEK,
  name: 'Seek by scrolling',
  category: CategoryTypes.CHAT,
  keywords: ['seek', 'control', 'scroll'],
});
