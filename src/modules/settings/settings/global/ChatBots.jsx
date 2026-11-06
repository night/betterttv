import React from 'react';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Bots'});
const COMMAND_AUTOCOMPLETE_NAME = formatMessage({defaultMessage: 'Command Autocomplete'});
const COMMAND_AUTOCOMPLETE_DESCRIPTION = formatMessage({
  defaultMessage: 'Enable command autocomplete for supported chatbot commands.',
});

function ChatBots({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.CHATBOT_COMMAND_AUTOCOMPLETE);
  const [normalizedValue, setNormalizedValue] = useProRequiredState({
    value,
    setValue,
    defaultValue: false,
  });

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        showProBadge
        name={COMMAND_AUTOCOMPLETE_NAME}
        description={COMMAND_AUTOCOMPLETE_DESCRIPTION}
        value={normalizedValue}
        onChange={setNormalizedValue}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: COMMAND_AUTOCOMPLETE_NAME,
  description: COMMAND_AUTOCOMPLETE_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHATBOTS,
});

SettingStore.registerSetting(ChatBots, {
  settingPanelId: SettingPanelIds.CHATBOTS,
  settingCategoryId: SettingCategoryIds.BOTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChatBots;
