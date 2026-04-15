import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Auto Live Chat View'});

function EmoteAutoLiveChatView(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_LIVE_CHAT_VIEW);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Auto Live Chat View'})}
        description={formatMessage({
          defaultMessage: 'Switch to the Live Chat view when chat loads.',
        })}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(EmoteAutoLiveChatView), {
  settingPanelId: SettingPanelIds.AUTO_LIVE_CHAT_VIEW,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['auto', 'live', 'chat', 'view'],
});

export default React.forwardRef(EmoteAutoLiveChatView);
