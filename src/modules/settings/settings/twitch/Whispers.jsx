import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Whispers'});

function DisableWhispers(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.WHISPERS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        description={formatMessage({defaultMessage: 'Enable and recieve Twitch whispers.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(DisableWhispers), {
  settingPanelId: SettingPanelIds.WHISPERS,
  name: SETTING_NAME,
  keywords: ['whispers', 'direct', 'messages'],
});

export default React.forwardRef(DisableWhispers);
