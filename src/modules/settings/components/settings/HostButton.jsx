import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';
import useStorageState from '../../../../common/hooks/StorageState.jsx';

function HostButton() {
  const [value, setValue] = useStorageState(SettingIds.HOST_BUTTON);

  return (
    <Panel header="Host Button">
      <div className={styles.toggle}>
        <p className={styles.description}>Adds a Host/Unhost button below the video player</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(HostButton, {
  settingId: SettingIds.HOST_BUTTON,
  name: 'Host Button',
  category: CategoryTypes.CHANNEL,
  keywords: ['host', 'button'],
});
