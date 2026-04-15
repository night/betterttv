import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Moderation'});

function Moderation(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.AUTO_MOD_VIEW);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Auto Mod View'})}
        description={formatMessage({
          defaultMessage: 'Enter moderation view when possible.',
        })}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(Moderation), {
  settingPanelId: SettingPanelIds.MODERATION,
  name: SETTING_NAME,
  keywords: ['auto', 'mod', 'view'],
});

export default React.forwardRef(Moderation);
