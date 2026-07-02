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

const SETTING_NAME = formatMessage({defaultMessage: 'Moderation'});

const AUTO_MOD_VIEW_NAME = formatMessage({defaultMessage: 'Auto Mod View'});
const AUTO_MOD_VIEW_DESCRIPTION = formatMessage({defaultMessage: 'Enter moderation view when possible.'});

function Moderation({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_MOD_VIEW);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={AUTO_MOD_VIEW_NAME}
        description={AUTO_MOD_VIEW_DESCRIPTION}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Moderation, {
  settingPanelId: SettingPanelIds.MODERATION,
  name: SETTING_NAME,
});

searchStore.registerSearchEntry({
  name: AUTO_MOD_VIEW_NAME,
  description: AUTO_MOD_VIEW_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.MODERATION),
  predicate: () => !isStandaloneWindow(),
});

export default Moderation;
