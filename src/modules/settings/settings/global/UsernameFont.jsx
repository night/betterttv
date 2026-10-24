import React from 'react';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingUsernameFont from '@/modules/settings/components/SettingUsernameFont';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Username Font'});

function UsernameFont({ref, ...props}) {
  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingUsernameFont />
    </SettingGroup>
  );
}

SettingStore.registerSetting(UsernameFont, {
  settingPanelId: SettingPanelIds.USERNAME_FONT,
  settingCategoryId: SettingCategoryIds.APPEARANCE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default UsernameFont;
