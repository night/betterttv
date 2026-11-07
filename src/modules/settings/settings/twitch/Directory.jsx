import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Directory'});
const DEFAULT_TO_LIVE_TAB_NAME = formatMessage({defaultMessage: 'Default to Live Tab'});
const DEFAULT_TO_LIVE_TAB_DESCRIPTION = formatMessage({defaultMessage: 'Default to live tab on the following page.'});

function ShowDirectoryLiveTab({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={DEFAULT_TO_LIVE_TAB_NAME}
        description={DEFAULT_TO_LIVE_TAB_DESCRIPTION}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: DEFAULT_TO_LIVE_TAB_NAME,
  description: DEFAULT_TO_LIVE_TAB_DESCRIPTION,
  settingPanelId: SettingPanelIds.DIRECTORY,
});

SettingStore.registerSetting(ShowDirectoryLiveTab, {
  settingPanelId: SettingPanelIds.DIRECTORY,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default ShowDirectoryLiveTab;
