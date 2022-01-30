import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

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

registerComponent(MuteInvisiblePlayer, {
  settingId: SettingIds.MUTE_INVISIBLE_PLAYER,
  name: 'Mute Invisible Player',
  category: CategoryTypes.CHANNEL,
  keywords: ['mute', 'invisible', 'player', 'video'],
});
