import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Click to Play'});

function ClickToPlay() {
  const [value, setValue] = useStorageState(SettingIds.CLICK_TO_PLAY);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enable clicking on the Twitch player to pause/resume playback'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ClickToPlay, {
  settingId: SettingIds.CLICK_TO_PLAY,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['click', 'play', 'player'],
});
