import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function HighlightFeedback() {
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_FEEDBACK);

  return (
    <Panel header="Highlight Feedback">
      <div className={styles.toggle}>
        <p className={styles.description}>Plays a sound for messages directed at you</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(HighlightFeedback, {
  settingId: SettingIds.HIGHLIGHT_FEEDBACK,
  name: 'Highlight Feedback',
  category: CategoryTypes.CHAT,
  keywords: ['highlight', 'feedback'],
});
