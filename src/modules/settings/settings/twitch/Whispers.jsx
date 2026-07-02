import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Whispers'});

function DisableWhispers({ref, ...props}) {
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

SettingStore.registerSetting(DisableWhispers, {
  settingPanelId: SettingPanelIds.WHISPERS,
  name: SETTING_NAME,
  keywords: ['whispers', 'direct', 'messages'],
});

export default DisableWhispers;
