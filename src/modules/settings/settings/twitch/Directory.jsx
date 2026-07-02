import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Directory'});

function ShowDirectoryLiveTab({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Default to Live Tab'})}
        description={formatMessage({defaultMessage: 'Default to live tab on the following page.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(ShowDirectoryLiveTab, {
  settingPanelId: SettingPanelIds.DIRECTORY,
  name: SETTING_NAME,
  keywords: ['live', 'tab'],
});

export default ShowDirectoryLiveTab;
