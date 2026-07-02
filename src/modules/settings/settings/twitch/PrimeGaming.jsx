import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {isStandaloneWindow} from '@/utils/window';

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

SettingStore.registerSetting(PrimeGaming, {
  settingPanelId: SettingPanelIds.PRIME_GAMING,
  name: SETTING_NAME,
});

searchStore.registerSearchEntry({
  name: PRIME_PROMOTIONS_NAME,
  description: PRIME_PROMOTIONS_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.PRIME_GAMING),
  predicate: () => !isStandaloneWindow(),
});

export default PrimeGaming;
