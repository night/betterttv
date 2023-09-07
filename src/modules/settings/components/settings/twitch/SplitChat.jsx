import React from 'react';
import Panel from 'rsuite/Panel';
import Toggle from 'rsuite/Toggle';
import ColorPicker from '../../../../../common/components/ColorPicker.jsx';
import useStorageState from '../../../../../common/hooks/StorageState.jsx';
import {CategoryTypes, SettingIds} from '../../../../../constants.js';
import formatMessage from '../../../../../i18n/index.js';
import SplitChatModule from '../../../../split_chat/index.js';
import styles from '../../../styles/header.module.css';
import {registerComponent} from '../../Store.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Split Chat'});

function SplitChat() {
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
    <Panel header={SETTING_NAME} className={styles.panelWithOverflow}>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>
          {formatMessage({defaultMessage: 'Alternate backgrounds between messages in chat to improve readability'})}
        </p>
        <Toggle checked={value} onChange={(state) => setValue(state)} />
      </div>
      <div className={styles.settingRow}>
        <p className={styles.settingDescription}>{formatMessage({defaultMessage: 'Alternate background color'})}</p>
        <ColorPicker color={colorValue || defaultColor} onChange={(newColor) => handleColorChange(newColor)} />
      </div>
    </Panel>
  );
}

registerComponent(SplitChat, {
  settingId: SettingIds.SPLIT_CHAT,
  name: SETTING_NAME,
  category: CategoryTypes.CHAT,
  keywords: ['split', 'chat'],
});
