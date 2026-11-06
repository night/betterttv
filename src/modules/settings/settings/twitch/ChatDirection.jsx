import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Direction'});

function ChatDirection({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Reverse the chat direction'})}
        description={formatMessage({defaultMessage: 'New messages move from top to bottom.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(ChatDirection, {
  settingPanelId: SettingPanelIds.CHAT_DIRECTION,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChatDirection;
