import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, ChatLayoutTypes} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingRadio from '@/modules/settings/components/SettingRadio';
import SettingRadioGroup from '@/modules/settings/components/SettingRadioGroup';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import {isStandaloneWindow} from '@/utils/window';

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

SettingStore.registerSetting(ChatLayout, {
  settingPanelId: SettingPanelIds.CHAT_LAYOUT,
  name: SETTING_NAME,
});

for (const entry of [
  {name: RIGHT_NAME, description: RIGHT_DESCRIPTION},
  {name: LEFT_NAME, description: LEFT_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({
    ...entry,
    goto: () => gotoSettingPanel(SettingPanelIds.CHAT_LAYOUT),
    predicate: () => !isStandaloneWindow(),
  });
}

export default ChatLayout;
