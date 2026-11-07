import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChatLayoutTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingRadio from '@/modules/settings/components/SettingRadio';
import SettingRadioGroup from '@/modules/settings/components/SettingRadioGroup';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Layout'});
const RIGHT_NAME = formatMessage({defaultMessage: 'Right'});
const RIGHT_DESCRIPTION = formatMessage({defaultMessage: 'Moves the chat to the right of the player.'});
const LEFT_NAME = formatMessage({defaultMessage: 'Left'});
const LEFT_DESCRIPTION = formatMessage({defaultMessage: 'Moves the chat to the left of the player.'});

function ChatLayout({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.CHAT_LAYOUT);

  return (
    <SettingRadioGroup ref={ref} {...props} name={SETTING_NAME} value={value} onChange={setValue}>
      <SettingRadio optionValue={ChatLayoutTypes.RIGHT} name={RIGHT_NAME} description={RIGHT_DESCRIPTION} />
      <SettingRadio optionValue={ChatLayoutTypes.LEFT} name={LEFT_NAME} description={LEFT_DESCRIPTION} />
    </SettingRadioGroup>
  );
}

registerSearchEntry({
  query: RIGHT_NAME,
  description: RIGHT_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT_LAYOUT,
});

registerSearchEntry({
  query: LEFT_NAME,
  description: LEFT_DESCRIPTION,
  settingPanelId: SettingPanelIds.CHAT_LAYOUT,
});

SettingStore.registerSetting(ChatLayout, {
  settingPanelId: SettingPanelIds.CHAT_LAYOUT,
  settingCategoryId: SettingCategoryIds.CHAT,
  name: SETTING_NAME,
});

export default ChatLayout;
