import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

function PinnedHighlights() {
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);

  return (
    <Panel header="Pinned Highlights">
      <div className={styles.toggle}>
        <p className={styles.description}>Pins your last ten highlighted messages above chat</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(PinnedHighlights, {
  settingId: SettingIds.PINNED_HIGHLIGHTS,
  name: 'Pinned Highlights',
  category: CategoryTypes.CHAT,
  keywords: ['pinned', 'highlights'],
});
