import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

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

SettingStore.registerSetting(ChatDirection, {
  settingPanelId: SettingPanelIds.CHAT_DIRECTION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: REVERSE_CHAT_DIRECTION_NAME,
  description: REVERSE_CHAT_DIRECTION_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.CHAT_DIRECTION),
});

export default ChatDirection;
