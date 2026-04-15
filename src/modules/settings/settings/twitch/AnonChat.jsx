import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';
import SettingTagInput from '../../components/SettingTagInput.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Anon Chat'});

function AnonChat(props, ref) {
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

SettingStore.registerSetting(React.forwardRef(AnonChat), {
  settingPanelId: SettingPanelIds.ANON_CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['anon', 'chat'],
});

export default React.forwardRef(AnonChat);
