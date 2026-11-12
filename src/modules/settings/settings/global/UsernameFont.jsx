import React from 'react';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingUsernameFont from '@/modules/settings/components/SettingUsernameFont';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Font'});

function UsernameFont({ref, ...props}) {
  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME} withPane={false}>
      <SettingUsernameFont />
    </SettingGroup>
  );
}

SettingStore.registerSetting(UsernameFont, {
  settingPanelId: SettingPanelIds.USERNAME_FONT,
  settingCategoryId: SettingCategoryIds.USERNAME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['username'],
});

export default UsernameFont;
