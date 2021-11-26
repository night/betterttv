import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function AlwaysSourceQuality() {
  const [value, setValue] = useStorageState(SettingIds.ALWAYS_SOURCE_QUALITY);

  return (
    <Panel header="Always Use Source Quality">
      <div className={styles.toggle}>
        <p className={styles.description}>Forces stream quality to use source quality</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AlwaysSourceQuality, {
  settingId: SettingIds.ALWAYS_SOURCE_QUALITY,
  name: 'Always Use Source Quality',
  category: CategoryTypes.CHANNEL,
  keywords: ['source', 'quality', 'stream', 'player'],
});
