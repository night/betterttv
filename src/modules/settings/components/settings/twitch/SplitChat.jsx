import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Split Chat'});

function SplitChat() {
  const [value, setValue] = useStorageState(SettingIds.SPLIT_CHAT);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Alternate backgrounds between messages in chat to improve readability'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(SplitChat, {
  settingId: SettingIds.SPLIT_CHAT,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['split', 'chat'],
});
