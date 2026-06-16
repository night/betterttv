import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';

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
