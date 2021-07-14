import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function MuteInvisiblePlayer() {
  const [value, setValue] = useStorageState(SettingIds.MUTE_INVISIBLE_PLAYER);

  return (
    <Panel header="Mute Invisible Player">
      <div className={styles.toggle}>
        <p className={styles.description}>
          Mutes/unmutes streams automatically when you change your browser window/tab
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(MuteInvisiblePlayer, {
  settingId: SettingIds.MUTE_INVISIBLE_PLAYER,
  name: 'Mute Invisible Player',
  category: CategoryTypes.CHANNEL,
  keywords: ['mute', 'invisible', 'player', 'video'],
});
