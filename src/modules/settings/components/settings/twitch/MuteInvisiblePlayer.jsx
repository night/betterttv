import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Mute Invisible Player'});

function MuteInvisiblePlayer() {
  const [value, setValue] = useStorageState(SettingIds.MUTE_INVISIBLE_PLAYER);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Mute/unmute streams automatically when you change your browser window/tab'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(MuteInvisiblePlayer, {
  settingId: SettingIds.MUTE_INVISIBLE_PLAYER,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['mute', 'invisible', 'player', 'video'],
});
