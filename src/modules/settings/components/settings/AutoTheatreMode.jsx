import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function AutoTheatreMode() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_THEATRE_MODE);

  return (
    <Panel header="Auto Theatre Mode">
      <div className={styles.toggle}>
        <p className={styles.description}>Enables theatre mode by default</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AutoTheatreMode, {
  settingId: SettingIds.AUTO_THEATRE_MODE,
  name: 'Auto Theatre Mode',
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'theatre', 'mode'],
});
