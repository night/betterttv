import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, ChannelPointsFlags} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingCheckbox from '../../components/SettingCheckbox.jsx';
import SettingCheckboxGroup from '../../components/SettingCheckboxGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Channel Points'});

function ChannelPointsModule(props, ref) {
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

SettingStore.registerSetting(React.forwardRef(ChannelPointsModule), {
  settingPanelId: SettingPanelIds.CHANNEL_POINTS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['channel', 'points', 'auto', 'claim'],
});

export default React.forwardRef(ChannelPointsModule);
