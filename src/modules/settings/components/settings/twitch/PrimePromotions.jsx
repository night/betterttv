import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import {registerComponent} from '../../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import styles from '../../../styles/header.module.css';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';

function HidePrimePromotions() {
  const [value, setValue] = useStorageState(SettingIds.PRIME_PROMOTIONS);

  return (
    <Panel header="Prime Promotions">
      <div className={styles.toggle}>
        <p className={styles.description}>Show Prime Gaming loot notices, like the ones in the sidebar</p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
    </Panel>
  );
}

registerComponent(HidePrimePromotions, {
  settingId: SettingIds.PRIME_PROMOTIONS,
  name: 'Prime Promotions',
  category: CategoryTypes.CHANNEL,
  keywords: ['ad', 'prime', 'promotions', 'block'],
});
