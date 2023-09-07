import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Tab Completion Emote Priority'});

function TabCompletionEmotePriority() {
  const [value, setValue] = useStorageState(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Prioritize emotes over usernames when using tab completion'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(TabCompletionEmotePriority, {
  settingId: SettingIds.TAB_COMPLETION_EMOTE_PRIORITY,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['tab', 'completion', 'emote', 'priority'],
});
