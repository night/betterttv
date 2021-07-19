import React from 'react';
import Panel from 'rsuite/lib/Panel/index.js';
import Toggle from 'rsuite/lib/Toggle/index.js';
import {registerComponent, useStorageState} from '../Store.jsx';
import {CategoryTypes, SettingIds} from '../../../../constants.js';
import styles from '../../styles/header.module.css';

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

export default registerComponent(HidePrimePromotions, {
  settingId: SettingIds.PRIME_PROMOTIONS,
  name: 'Prime Promotions',
  category: CategoryTypes.CHANNEL,
  keywords: ['ad', 'prime', 'promotions', 'block'],
});
