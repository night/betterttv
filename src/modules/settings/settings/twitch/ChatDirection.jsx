import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Direction'});
const REVERSE_CHAT_DIRECTION_NAME = formatMessage({defaultMessage: 'Reverse Chat Direction'});
const REVERSE_CHAT_DIRECTION_DESCRIPTION = formatMessage({
  defaultMessage: 'Move new chat messages from top to bottom of chat.',
});

function ChatDirection({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={REVERSE_CHAT_DIRECTION_NAME}
        description={REVERSE_CHAT_DIRECTION_DESCRIPTION}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: REVERSE_CHAT_DIRECTION_NAME,
  description: REVERSE_CHAT_DIRECTION_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT_DIRECTION,
});

SettingStore.registerSetting(ChatDirection, {
  settingPanelId: SettingPanelIds.CHAT_DIRECTION,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChatDirection;
