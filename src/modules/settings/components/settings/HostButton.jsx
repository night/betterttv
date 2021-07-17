import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

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
