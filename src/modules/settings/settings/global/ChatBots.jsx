import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Bots'});

function ChatBots(props, ref) {
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
        name={formatMessage({defaultMessage: 'Command Autocomplete'})}
        value={normalizedValue}
        onChange={setNormalizedValue}
        description={formatMessage({
          defaultMessage: 'Enable command autocomplete for supported chatbot commands.',
        })}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(ChatBots), {
  settingPanelId: SettingPanelIds.CHATBOTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['command', 'autocomplete', 'nightbot', 'fossabot', 'moobot', 'streamelements', 'commands', 'chat', 'bot'],
});

export default React.forwardRef(ChatBots);
