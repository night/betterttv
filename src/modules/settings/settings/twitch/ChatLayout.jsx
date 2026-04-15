import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds, ChatLayoutTypes} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingRadio from '../../components/SettingRadio.jsx';
import SettingRadioGroup from '../../components/SettingRadioGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Chat Layout'});

function ChatLayout(props, ref) {
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

SettingStore.registerSetting(React.forwardRef(ChatLayout), {
  settingPanelId: SettingPanelIds.CHAT_LAYOUT,
  name: SETTING_NAME,
  keywords: ['chat', 'layout', 'position', 'placement', 'left', 'right'],
});

export default React.forwardRef(ChatLayout);
