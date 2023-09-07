import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Prime Promotions'});

function HidePrimePromotions() {
  const [value, setValue] = useStorageState(SettingIds.PRIME_PROMOTIONS);

  return (
    <Panel header={SETTING_NAME}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Show Prime Gaming loot notices, like the ones in the sidebar'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(HidePrimePromotions, {
  settingId: SettingIds.PRIME_PROMOTIONS,
  name: SETTING_NAME,
  category: CategoryTypes.CHANNEL,
  keywords: ['ad', 'prime', 'promotions', 'block'],
});
