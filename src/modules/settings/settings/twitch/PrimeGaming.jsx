import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Prime Gaming'});

function PrimeGaming(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.PRIME_PROMOTIONS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Prime Promotions'})}
        description={formatMessage({defaultMessage: 'Show Prime Gaming loot notices, like the ones in the sidebar.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(PrimeGaming), {
  settingPanelId: SettingPanelIds.PRIME_GAMING,
  name: SETTING_NAME,
  keywords: ['ad', 'prime', 'promotions', 'block', 'gaming'],
});

export default React.forwardRef(PrimeGaming);
