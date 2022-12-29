import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Player Extensions'});

function HidePlayerExtensions() {
  const [value, setValue] = useStorageState(SettingIds.PLAYER_EXTENSIONS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: "Show the interactive overlays on top of Twitch's video player"})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(HidePlayerExtensions, {
  settingId: SettingIds.PLAYER_EXTENSIONS,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['player', 'extensions', 'addons'],
});
