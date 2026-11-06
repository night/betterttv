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
        name={formatMessage({defaultMessage: 'Show in chat'})}
        value={ChannelPointsFlags.CHANNEL_POINTS}
        description={formatMessage({defaultMessage: 'Keeps your balance visible in the chat window.'})}
      />
      <SettingCheckbox
        value={ChannelPointsFlags.AUTO_CLAIM}
        name={formatMessage({defaultMessage: 'Claim automatically'})}
        description={formatMessage({defaultMessage: "Collects them as soon as they're available."})}
      />
      <SettingCheckbox
        value={ChannelPointsFlags.MESSAGE_HIGHLIGHTS}
        name={formatMessage({defaultMessage: 'Show highlighted rewards'})}
        description={formatMessage({
          defaultMessage: 'Messages paid for with channel points in the chat window.',
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
