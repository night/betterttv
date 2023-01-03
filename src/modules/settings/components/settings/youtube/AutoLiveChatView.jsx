import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Live Chat View'});

function EmoteAutoLiveChatView() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_LIVE_CHAT_VIEW);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Switch to the Live Chat view automatically when chat loads'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(EmoteAutoLiveChatView, {
  settingId: SettingIds.LIVE_CHAT_VIEW,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['auto', 'live', 'chat', 'view'],
});
