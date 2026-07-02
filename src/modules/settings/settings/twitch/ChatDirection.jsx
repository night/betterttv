import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Direction'});

function ChatDirection({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Reverse Chat Direction'})}
        description={formatMessage({defaultMessage: 'Move new chat messages from top to bottom of chat.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(ChatDirection, {
  settingPanelId: SettingPanelIds.CHAT_DIRECTION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['chat', 'direction', 'up', 'down', 'reverse'],
});

export default ChatDirection;
