import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingTagInput from '@/modules/settings/components/SettingTagInput';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Raids'});
const AUTO_JOIN_NAME = formatMessage({defaultMessage: 'Auto Join'});
const AUTO_JOIN_DESCRIPTION = formatMessage({defaultMessage: 'Join raids when possible.'});

function AutoJoinRaids({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_JOIN_RAIDS);
  const [channels, setChannels] = useStorageState(
    value ? SettingIds.AUTO_JOIN_RAIDS_WHITELISTED_CHANNELS : SettingIds.AUTO_JOIN_RAIDS_BLACKLISTED_CHANNELS
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={AUTO_JOIN_NAME} description={AUTO_JOIN_DESCRIPTION} value={value} onChange={setValue} />
      <SettingTagInput
        name={
          value
            ? formatMessage({defaultMessage: 'Blacklist Channels'})
            : formatMessage({defaultMessage: 'Whitelist Channels'})
        }
        description={
          value
            ? formatMessage({defaultMessage: 'List of channels that disable auto joining raids.'})
            : formatMessage({defaultMessage: 'List of channels that enable auto joining raids.'})
        }
        value={channels}
        onChange={setChannels}
        withCurrentChannel
        placeholder={formatMessage({defaultMessage: 'channel, etc..'})}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: AUTO_JOIN_NAME,
  description: AUTO_JOIN_DESCRIPTION,
  keywords: ['blacklist channels', 'whitelist channels'],
  settingPanelId: SettingPanelIds.RAIDS,
});

SettingStore.registerSetting(AutoJoinRaids, {
  settingPanelId: SettingPanelIds.RAIDS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default AutoJoinRaids;
