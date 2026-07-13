import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChannelPointsFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Channel Points'});

function ChannelPointsModule({ref, ...props}) {
  const [channelPoints, setChannelPoints] = useStorageState(SettingIds.CHANNEL_POINTS);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={channelPoints}
      onChange={setChannelPoints}
      flags={Object.values(ChannelPointsFlags)}>
      <SettingCheckbox
        value={ChannelPointsFlags.CHANNEL_POINTS}
        name={formatMessage({defaultMessage: 'Channel Points'})}
        description={formatMessage({defaultMessage: 'Show channel points in the chat window.'})}
      />
      <SettingCheckbox
        value={ChannelPointsFlags.AUTO_CLAIM}
        name={formatMessage({defaultMessage: 'Auto Claim'})}
        description={formatMessage({defaultMessage: 'Claim bonus channel points when available.'})}
      />
      <SettingCheckbox
        value={ChannelPointsFlags.MESSAGE_HIGHLIGHTS}
        name={formatMessage({defaultMessage: 'Message Highlight Rewards'})}
        description={formatMessage({
          defaultMessage: 'Show channel point highlighted messages in the chat window.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(ChannelPointsModule, {
  settingPanelId: SettingPanelIds.CHANNEL_POINTS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChannelPointsModule;
