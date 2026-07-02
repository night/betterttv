import React from 'react';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

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
        ref={ref}
        {...props}
        showProBadge
        showBetaBadge
        name={COMMAND_AUTOCOMPLETE_NAME}
        value={normalizedValue}
        onChange={setNormalizedValue}
        description={COMMAND_AUTOCOMPLETE_DESCRIPTION}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(ChatBots, {
  settingPanelId: SettingPanelIds.CHATBOTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: COMMAND_AUTOCOMPLETE_NAME,
  description: COMMAND_AUTOCOMPLETE_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.CHATBOTS),
});

export default ChatBots;
