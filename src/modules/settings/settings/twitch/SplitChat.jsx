import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingColorPicker from '@/modules/settings/components/SettingColorPicker';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';
import SplitChatModule from '@/modules/split_chat/index';

const SETTING_NAME = formatMessage({defaultMessage: 'Split Chat'});
const SETTING_DESCRIPTION = formatMessage({
  defaultMessage: 'Alternate backgrounds between messages in chat to improve readability.',
});

const ALTERNATE_BACKGROUND_COLOR_NAME = formatMessage({defaultMessage: 'Alternate Background Color'});
const ALTERNATE_BACKGROUND_COLOR_DESCRIPTION = formatMessage({
  defaultMessage: 'The color of the alternate background.',
});

function SplitChat({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.SPLIT_CHAT);
  const [colorValue, setColorValue] = useStorageState(SettingIds.SPLIT_CHAT_COLOR);
  const defaultColor = SplitChatModule.getDefaultColor();

  function handleColorChange(newColor) {
    if (newColor == null || newColor === '' || newColor === defaultColor) {
      setColorValue(null);
      return;
    }
    setColorValue(newColor);
  }

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch name={SETTING_NAME} reverse description={SETTING_DESCRIPTION} value={value} onChange={setValue} />
      <SettingColorPicker
        reverse
        name={ALTERNATE_BACKGROUND_COLOR_NAME}
        description={ALTERNATE_BACKGROUND_COLOR_DESCRIPTION}
        value={colorValue}
        defaultValue={defaultColor}
        onChange={handleColorChange}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(SplitChat, {
  settingPanelId: SettingPanelIds.SPLIT_CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: SETTING_NAME, description: SETTING_DESCRIPTION},
  {name: ALTERNATE_BACKGROUND_COLOR_NAME, description: ALTERNATE_BACKGROUND_COLOR_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.SPLIT_CHAT)});
}

export default SplitChat;
