import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import Input from 'rsuite/Input';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function PinnedHighlights() {
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);
  const [maxPinnedHighlights, setMaxPinnedHighlights] = useStorageState(SettingIds.MAX_PINNED_HIGHLIGHTS);

  return (
    <Panel header="Pinned Highlights">
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Pin your highlighted messages above chat</p>
        <Toggle checked={value} onChange={setValue} />
      </div>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>Maximum pinned highlights</p>
        <Input
          className={styles.settingInputNumber}
          type="number"
          min={1}
          max={25}
          disabled={!value}
          value={maxPinnedHighlights}
          onChange={setMaxPinnedHighlights}
        />
      </div>
    </Panel>
  );
}

registerComponent(PinnedHighlights, {
  settingId: SettingIds.PINNED_HIGHLIGHTS,
  name: 'Pinned Highlights',
  category: CategoryTypes.CHAT,
  keywords: ['pinned', 'highlights'],
});
