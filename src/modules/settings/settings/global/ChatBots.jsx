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
        name={formatMessage({defaultMessage: 'Command Autocomplete'})}
        description={formatMessage({
          defaultMessage: 'Enable command autocomplete for supported chatbot commands.',
        })}
        value={normalizedValue}
        onChange={setNormalizedValue}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: formatMessage({defaultMessage: 'Command Autocomplete'}),
  description: formatMessage({defaultMessage: 'Enable command autocomplete for supported chatbot commands.'}),
  settingPanelId: SettingPanelIds.CHATBOTS,
});

SettingStore.registerSetting(ChatBots, {
  settingPanelId: SettingPanelIds.CHATBOTS,
  settingCategoryId: SettingCategoryIds.BOTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChatBots;
