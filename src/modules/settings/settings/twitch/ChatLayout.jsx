import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChatLayoutTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingRadio from '@/modules/settings/components/SettingRadio';
import SettingRadioGroup from '@/modules/settings/components/SettingRadioGroup';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Layout'});

function ChatLayout({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.CHAT_LAYOUT);

  return (
    <SettingRadioGroup ref={ref} {...props} name={SETTING_NAME} value={value} onChange={setValue}>
      <SettingRadio
        optionValue={ChatLayoutTypes.RIGHT}
        name={formatMessage({defaultMessage: 'Right'})}
        description={formatMessage({defaultMessage: 'Moves the chat to the right of the player.'})}
      />
      <SettingRadio
        optionValue={ChatLayoutTypes.LEFT}
        name={formatMessage({defaultMessage: 'Left'})}
        description={formatMessage({defaultMessage: 'Moves the chat to the left of the player.'})}
      />
    </SettingRadioGroup>
  );
}

SettingStore.registerSetting(ChatLayout, {
  settingPanelId: SettingPanelIds.CHAT_LAYOUT,
  name: SETTING_NAME,
  keywords: ['chat', 'layout', 'position', 'placement', 'left', 'right'],
});

export default ChatLayout;
