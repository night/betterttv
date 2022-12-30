import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Reverse Chat Direction'});

function ReverseChatDirection() {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Move new chat messages to the top of chat'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ReverseChatDirection, {
  settingId: SettingIds.REVERSE_CHAT_DIRECTION,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['chat', 'direction', 'up', 'down', 'reverse'],
});
