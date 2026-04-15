import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Directory'});

function ShowDirectoryLiveTab(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.SHOW_DIRECTORY_LIVE_TAB);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Default to Live Tab'})}
        description={formatMessage({defaultMessage: 'Default to live tab on the following page.'})}
        value={value}
        onChange={setValue}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(ShowDirectoryLiveTab), {
  settingPanelId: SettingPanelIds.DIRECTORY,
  name: SETTING_NAME,
  keywords: ['live', 'tab'],
});

export default React.forwardRef(ShowDirectoryLiveTab);
