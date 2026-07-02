import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Live Chat View'});
const SETTING_DESCRIPTION = formatMessage({defaultMessage: 'Switch to the Live Chat view when chat loads.'});

function EmoteAutoLiveChatView({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_LIVE_CHAT_VIEW);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

SettingStore.registerSetting(EmoteAutoLiveChatView, {
  settingPanelId: SettingPanelIds.AUTO_LIVE_CHAT_VIEW,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.AUTO_LIVE_CHAT_VIEW),
});

export default EmoteAutoLiveChatView;
