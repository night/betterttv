import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Hype Chat'});

function HypeChat() {
  const [value, setValue] = useStorageState(SettingIds.HYPE_CHAT);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Show hype chat messages in the chat window'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(HypeChat, {
  settingId: SettingIds.HYPE_CHAT,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['hype', 'chat', 'message'],
});
