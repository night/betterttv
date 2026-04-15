import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SplitChatModule from '../../../split_chat/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';
import SettingColorPicker from '../../components/SettingColorPicker.jsx';

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
