import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingTagInput from '@/modules/settings/components/SettingTagInput';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Anon Chat'});

function AnonChat({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.ANON_CHAT);
  const [channels, setChannels] = useStorageState(
    value ? SettingIds.ANON_CHAT_WHITELISTED_CHANNELS : SettingIds.ANON_CHAT_BLACKLISTED_CHANNELS
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        description={formatMessage({defaultMessage: 'Anonymously read chat without appearing in the user list.'})}
        value={value}
        onChange={setValue}
      />
      <SettingTagInput
        name={
          value
            ? formatMessage({defaultMessage: 'Whitelist Channels'})
            : formatMessage({defaultMessage: 'Blacklist Channels'})
        }
        description={
          value
            ? formatMessage({defaultMessage: 'List of channels that disable Anon Chat.'})
            : formatMessage({defaultMessage: 'List of channels that enable Anon Chat.'})
        }
        value={channels}
        onChange={setChannels}
        withCurrentChannel
        placeholder={formatMessage({defaultMessage: 'channel, etc..'})}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(AnonChat, {
  settingPanelId: SettingPanelIds.ANON_CHAT,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default AnonChat;
