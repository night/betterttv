import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Theatre Mode'});

function AutoTheatreMode() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_THEATRE_MODE);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enable theatre mode automatically'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(AutoTheatreMode, {
  settingId: SettingIds.AUTO_THEATRE_MODE,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'theatre', 'mode'],
});
