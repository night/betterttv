import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Raids'});

function AutoJoinRaids(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_JOIN_RAIDS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Auto Join'})}
        description={formatMessage({defaultMessage: 'Join raids when possible.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(AutoJoinRaids), {
  settingPanelId: SettingPanelIds.RAIDS,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['auto', 'join', 'raids'],
});

export default React.forwardRef(AutoJoinRaids);
