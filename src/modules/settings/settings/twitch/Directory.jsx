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

const SETTING_NAME = formatMessage({defaultMessage: 'Directory'});

const LIVE_TAB_NAME = formatMessage({defaultMessage: 'Default to Live Tab'});
const LIVE_TAB_DESCRIPTION = formatMessage({defaultMessage: 'Default to live tab on the following page.'});

function ShowDirectoryLiveTab({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={LIVE_TAB_NAME} description={LIVE_TAB_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

SettingStore.registerSetting(ShowDirectoryLiveTab, {
  settingPanelId: SettingPanelIds.DIRECTORY,
  name: SETTING_NAME,
});

searchStore.registerSearchEntry({
  name: LIVE_TAB_NAME,
  description: LIVE_TAB_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.DIRECTORY),
  predicate: () => !isStandaloneWindow(),
});

export default ShowDirectoryLiveTab;
