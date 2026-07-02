import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingTagInput from '@/modules/settings/components/SettingTagInput';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Anon Chat'});
const SETTING_DESCRIPTION = formatMessage({
  defaultMessage: 'Anonymously read chat without appearing in the user list.',
});

const WHITELIST_CHANNELS_NAME = formatMessage({defaultMessage: 'Whitelist Channels'});
const WHITELIST_CHANNELS_DESCRIPTION = formatMessage({defaultMessage: 'List of channels that disable Anon Chat.'});
const BLACKLIST_CHANNELS_NAME = formatMessage({defaultMessage: 'Blacklist Channels'});
const BLACKLIST_CHANNELS_DESCRIPTION = formatMessage({defaultMessage: 'List of channels that enable Anon Chat.'});

function AnonChat({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.ANON_CHAT);
  const [channels, setChannels] = useStorageState(
    value ? SettingIds.ANON_CHAT_WHITELISTED_CHANNELS : SettingIds.ANON_CHAT_BLACKLISTED_CHANNELS
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
      <SettingTagInput
        name={value ? WHITELIST_CHANNELS_NAME : BLACKLIST_CHANNELS_NAME}
        description={value ? WHITELIST_CHANNELS_DESCRIPTION : BLACKLIST_CHANNELS_DESCRIPTION}
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
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.ANON_CHAT),
});

export default AnonChat;
