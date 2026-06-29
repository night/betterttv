import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

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
