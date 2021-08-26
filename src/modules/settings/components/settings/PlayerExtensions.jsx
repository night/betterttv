import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function HidePlayerExtensions() {
  const [value, setValue] = useStorageState(SettingIds.PLAYER_EXTENSIONS);

  return (
    <Panel header="Player Extensions">
      <div className={styles.toggle}>
        <p className={styles.description}>Show the interactive overlays on top of Twitch&apos;s video player</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(HidePlayerExtensions, {
  settingId: SettingIds.PLAYER_EXTENSIONS,
  name: 'Player Extensions',
  category: CategoryTypes.CHANNEL,
  keywords: ['player', 'extensions', 'addons'],
});
