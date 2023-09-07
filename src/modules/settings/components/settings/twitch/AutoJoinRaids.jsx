import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Join Raids'});

function AutoJoinRaids() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_JOIN_RAIDS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Join raids automatically'})}</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AutoJoinRaids, {
  settingId: SettingIds.AUTO_JOIN_RAIDS,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'join', 'raids'],
});
