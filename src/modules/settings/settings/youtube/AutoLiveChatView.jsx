import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Live Chat View'});
const SETTING_DESCRIPTION = formatMessage({
  defaultMessage: 'Switch to the Live Chat view when chat loads.',
});

function EmoteAutoLiveChatView({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_LIVE_CHAT_VIEW);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  settingPanelId: SettingPanelIds.AUTO_LIVE_CHAT_VIEW,
});

SettingStore.registerSetting(EmoteAutoLiveChatView, {
  settingPanelId: SettingPanelIds.AUTO_LIVE_CHAT_VIEW,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default EmoteAutoLiveChatView;
