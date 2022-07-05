import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function ShadowBanDetector() {
  const [value, setValue] = useStorageState(SettingIds.SHADOW_BAN_DETECTOR);

  return (
    <Panel header="Shadow Ban Detection">
      <div className={styles.toggle}>
        <p className={styles.description}>Shows confirmations for messages being sent</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ShadowBanDetector, {
  settingId: SettingIds.SHADOW_BAN_DETECTOR,
  name: 'Shadow Ban Detection',
  category: CategoryTypes.CHAT,
  keywords: ['twitch', 'ban', 'chat', 'shadow', 'message', 'confirmation'],
});
