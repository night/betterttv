import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingTagInput from '@/modules/settings/components/SettingTagInput';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Raids'});

function AutoJoinRaids({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_JOIN_RAIDS);
  const [channels, setChannels] = useStorageState(
    value ? SettingIds.AUTO_JOIN_RAIDS_WHITELISTED_CHANNELS : SettingIds.AUTO_JOIN_RAIDS_BLACKLISTED_CHANNELS
  );

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Auto Join'})}
        description={formatMessage({defaultMessage: 'Join raids when possible.'})}
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

SettingStore.registerSetting(AutoJoinRaids, {
  settingPanelId: SettingPanelIds.RAIDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['auto', 'join', 'raids'],
});

export default AutoJoinRaids;
