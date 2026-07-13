import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingPrimaryColorRadio from '@/modules/settings/components/SettingPrimaryColorRadio';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

function Theme({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.PRIMARY_COLOR);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingPrimaryColorRadio
        value={value}
        onChange={setValue}
        name={formatMessage({defaultMessage: 'Accent Color'})}
        description={formatMessage({defaultMessage: 'The primary accent color of the theme.'})}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Theme, {
  settingPanelId: SettingPanelIds.THEME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['primary', 'color', 'theme', 'accent'],
});

export default Theme;
