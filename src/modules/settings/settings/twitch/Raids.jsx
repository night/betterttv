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

const SETTING_NAME = formatMessage({defaultMessage: 'Raids'});

const AUTO_JOIN_NAME = formatMessage({defaultMessage: 'Auto Join'});
const AUTO_JOIN_DESCRIPTION = formatMessage({defaultMessage: 'Join raids when possible.'});

const WHITELIST_CHANNELS_NAME = formatMessage({defaultMessage: 'Whitelist Channels'});
const WHITELIST_CHANNELS_DESCRIPTION = formatMessage({
  defaultMessage: 'List of channels that disable auto joining raids.',
});
const BLACKLIST_CHANNELS_NAME = formatMessage({defaultMessage: 'Blacklist Channels'});
const BLACKLIST_CHANNELS_DESCRIPTION = formatMessage({
  defaultMessage: 'List of channels that enable auto joining raids.',
});

function AutoJoinRaids({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_JOIN_RAIDS);
  const [channels, setChannels] = useStorageState(
    value ? SettingIds.AUTO_JOIN_RAIDS_WHITELISTED_CHANNELS : SettingIds.AUTO_JOIN_RAIDS_BLACKLISTED_CHANNELS
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={AUTO_JOIN_NAME} description={AUTO_JOIN_DESCRIPTION} value={value} onChange={setValue} />
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

SettingStore.registerSetting(AutoJoinRaids, {
  settingPanelId: SettingPanelIds.RAIDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

searchStore.registerSearchEntry({
  name: AUTO_JOIN_NAME,
  description: AUTO_JOIN_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.RAIDS),
});

export default AutoJoinRaids;
