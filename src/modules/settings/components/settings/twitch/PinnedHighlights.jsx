import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import Input from 'rsuite/Input';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

const PinnedHighlights = function PinnedHighlights() {
  const [value, setValue] = useStorageState(SettingIds.PINNED_HIGHLIGHTS);
  const [pinnedHighlights, setPinnedHighlights] = useStorageState(SettingIds.NUMBER_OF_PINNED_HIGHLIGHTS);

  return (
    <Panel header="Pinned Highlights">
      <div className={styles.toggle}>
        <p className={styles.description}>Pins your highlighted messages above chat</p>
        <Toggle checked={value} onChange={setValue} />
      </div>
      <div className={styles.input}>
        <p className={styles.description}>Configures the number of pinned highlights</p>
        <Input
          className={styles.inputNumber}
          type="number"
          min={0}
          disabled={!value}
          value={pinnedHighlights}
          onChange={setPinnedHighlights}
        />
      </div>
    </Panel>
  );
};

registerComponent(PinnedHighlights, {
  settingId: SettingIds.PINNED_HIGHLIGHTS,
  name: 'Pinned Highlights',
  category: CategoryTypes.CHAT,
  keywords: ['pinned', 'highlights'],
});
