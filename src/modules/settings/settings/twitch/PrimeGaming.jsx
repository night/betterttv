import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Prime Gaming'});
const PRIME_PROMOTIONS_NAME = formatMessage({defaultMessage: 'Prime Promotions'});
const PRIME_PROMOTIONS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show Prime Gaming loot notices, like the ones in the sidebar.',
});

function PrimeGaming({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.PRIME_PROMOTIONS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={PRIME_PROMOTIONS_NAME}
        description={PRIME_PROMOTIONS_DESCRIPTION}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: PRIME_PROMOTIONS_NAME,
  description: PRIME_PROMOTIONS_DESCRIPTION,
  settingPanelId: SettingPanelIds.PRIME_GAMING,
});

SettingStore.registerSetting(PrimeGaming, {
  settingPanelId: SettingPanelIds.PRIME_GAMING,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
});

export default PrimeGaming;
