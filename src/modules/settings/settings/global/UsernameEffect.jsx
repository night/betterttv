import React from 'react';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingUsernameEffect from '@/modules/settings/components/SettingUsernameEffect';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Username Effect'});

function UsernameEffect({ref, ...props}) {
  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingUsernameEffect />
    </SettingGroup>
  );
}

SettingStore.registerSetting(UsernameEffect, {
  settingPanelId: SettingPanelIds.USERNAME_EFFECT,
  settingCategoryId: SettingCategoryIds.APPEARANCE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default UsernameEffect;
