import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Highlight Feedback'});

function HighlightFeedback() {
  const [value, setValue] = useStorageState(SettingIds.HIGHLIGHT_FEEDBACK);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Play a sound for messages directed at you'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(HighlightFeedback, {
  settingId: SettingIds.HIGHLIGHT_FEEDBACK,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['highlight', 'feedback'],
});
