import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Show Directory Live Tab'});

function ShowDirectoryLiveTab() {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Swap to Live tab on the Following page automatically'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(ShowDirectoryLiveTab, {
  settingId: SettingIds.SHOW_DIRECTORY_LIVE_TAB,
  name: SETTING_NAME,
  category: CategoryTypes.DIRECTORY,
  keywords: ['live', 'tab'],
});
