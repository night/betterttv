import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {SettingIds, CategoryTypes} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import formatMessage from '../../../../../i18n/index.js';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Mod View'});

function AutoModView() {
  const [value, setValue] = useStorageState(SettingIds.AUTO_MOD_VIEW);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Enter mod view automatically when you enter channels you moderate'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

export default registerComponent(AutoModView, {
  settingId: SettingIds.AUTO_MOD_VIEW,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['auto', 'mod', 'view'],
});
