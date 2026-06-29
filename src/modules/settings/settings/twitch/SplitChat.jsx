import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingColorPicker from '@/modules/settings/components/SettingColorPicker';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SplitChatModule from '@/modules/split_chat/index';

const SETTING_NAME = formatMessage({defaultMessage: 'Split Chat'});

function SplitChat(props, ref) {
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
      <SettingSwitch
        name={SETTING_NAME}
        reverse
        description={formatMessage({
          defaultMessage: 'Alternate backgrounds between messages in chat to improve readability.',
        })}
        value={value}
        onChange={setValue}
      />
      <SettingColorPicker
        reverse
        name={formatMessage({defaultMessage: 'Alternate Background Color'})}
        description={formatMessage({
          defaultMessage: 'The color of the alternate background.',
        })}
        value={colorValue}
        defaultValue={defaultColor}
        onChange={handleColorChange}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(SplitChat), {
  settingPanelId: SettingPanelIds.SPLIT_CHAT,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['split', 'chat'],
});

export default React.forwardRef(SplitChat);
