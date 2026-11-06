import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChannelPointsFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Channel Points'});
const SETTING_DESCRIPTION = formatMessage({defaultMessage: 'Show channel points in the chat window.'});
const AUTO_CLAIM_NAME = formatMessage({defaultMessage: 'Auto Claim'});
const AUTO_CLAIM_DESCRIPTION = formatMessage({defaultMessage: 'Claim bonus channel points when available.'});
const MESSAGE_HIGHLIGHT_REWARDS_NAME = formatMessage({defaultMessage: 'Message Highlight Rewards'});
const MESSAGE_HIGHLIGHT_REWARDS_DESCRIPTION = formatMessage({
  defaultMessage: 'Show channel point highlighted messages in the chat window.',
});

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
        name={SETTING_NAME}
        description={SETTING_DESCRIPTION}
      />
      <SettingCheckbox
        value={ChannelPointsFlags.AUTO_CLAIM}
        name={AUTO_CLAIM_NAME}
        description={AUTO_CLAIM_DESCRIPTION}
      />
      <SettingCheckbox
        value={ChannelPointsFlags.MESSAGE_HIGHLIGHTS}
        name={MESSAGE_HIGHLIGHT_REWARDS_NAME}
        description={MESSAGE_HIGHLIGHT_REWARDS_DESCRIPTION}
      />
    </SettingCheckboxGroup>
  );
}

registerSearchEntry({
  query: SETTING_NAME,
  description: SETTING_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHANNEL_POINTS,
});

registerSearchEntry({
  query: AUTO_CLAIM_NAME,
  description: AUTO_CLAIM_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHANNEL_POINTS,
});

registerSearchEntry({
  query: MESSAGE_HIGHLIGHT_REWARDS_NAME,
  description: MESSAGE_HIGHLIGHT_REWARDS_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHANNEL_POINTS,
});

SettingStore.registerSetting(ChannelPointsModule, {
  settingPanelId: SettingPanelIds.CHANNEL_POINTS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default ChannelPointsModule;
