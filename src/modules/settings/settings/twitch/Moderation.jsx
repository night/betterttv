import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Moderation'});

function Moderation({ref, ...props}) {
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

SettingStore.registerSetting(Moderation, {
  settingPanelId: SettingPanelIds.MODERATION,
  name: SETTING_NAME,
  keywords: ['auto', 'mod', 'view'],
});

export default Moderation;
