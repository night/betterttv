import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Tab Completion'});

function TabCompletion(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.TAB_COMPLETION_EMOTE_PRIORITY);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Prioritize Emotes'})}
        description={formatMessage({defaultMessage: 'Prefer emotes over usernames when using tab completion.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(TabCompletion), {
  settingPanelId: SettingPanelIds.TAB_COMPLETION,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['tab', 'completion', 'emote', 'priority'],
});

export default React.forwardRef(TabCompletion);
