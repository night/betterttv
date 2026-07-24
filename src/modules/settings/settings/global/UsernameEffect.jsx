import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingUsernameEffect from '@/modules/settings/components/SettingUsernameEffect';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Username Effect'});

function UsernameEffect({ref, ...props}) {
  const [reducedMotion, setReducedMotion] = useStorageState(SettingIds.REDUCED_USERNAME_EFFECTS);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingUsernameEffect />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Reduced Motion'})}
        description={formatMessage({defaultMessage: 'Display username effects without animation.'})}
        value={reducedMotion}
        onChange={setReducedMotion}
      />
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
