import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function TimeoutHighlights() {
  const [value, setValue] = useStorageState(SettingIds.TIMEOUT_HIGHLIGHTS);

  return (
    <Panel header="Timeout Highlights">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Hide pinned highlights after 1 minute</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(TimeoutHighlights, {
  settingId: SettingIds.TIMEOUT_HIGHLIGHTS,
  name: 'Timeout Highlights',
  category: CategoryTypes.CHAT,
  keywords: ['time', 'out', 'highlights'],
});
