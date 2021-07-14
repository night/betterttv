import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function TimeoutHighlights() {
  const [value, setValue] = useStorageState(SettingIds.TIMEOUT_HIGHLIGHTS);

  return (
    <Panel header="Timeout Highlights">
      <div className={styles.toggle}>
        <p className={styles.description}>Hides pinned highlights after 1 minute</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(TimeoutHighlights, {
  settingId: SettingIds.TIMEOUT_HIGHLIGHTS,
  name: 'Timeout Highlights',
  category: CategoryTypes.CHAT,
  keywords: ['time', 'out', 'highlights'],
});
