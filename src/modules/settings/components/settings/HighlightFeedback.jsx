import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

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

export default registerComponent(HighlightFeedback, {
  settingId: SettingIds.HIGHLIGHT_FEEDBACK,
  name: 'Highlight Feedback',
  category: CategoryTypes.CHAT,
  keywords: ['highlight', 'feedback'],
});
