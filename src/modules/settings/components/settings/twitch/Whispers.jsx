import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Whispers'});

function DisableWhispers() {
  const [value, setValue] = useStorageState(SettingIds.WHISPERS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enable Twitch whispers and show any whispers you receive'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(DisableWhispers, {
  settingId: SettingIds.WHISPERS,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['whispers', 'direct', 'messages'],
});
