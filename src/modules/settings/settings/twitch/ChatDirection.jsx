import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Direction'});

function ChatDirection(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.REVERSE_CHAT_DIRECTION);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Reverse Chat Direction'})}
        description={formatMessage({defaultMessage: 'Move new chat messages from top to bottom of chat.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(ChatDirection), {
  settingPanelId: SettingPanelIds.CHAT_DIRECTION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['chat', 'direction', 'up', 'down', 'reverse'],
});

export default React.forwardRef(ChatDirection);
