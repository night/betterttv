import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';

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
