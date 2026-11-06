import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Accessibility'});

function Accessibility({ref, ...props}) {
  const [reducedMotion, setReducedMotion] = useStorageState(SettingIds.REDUCED_MOTION);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Reduce Motion'})}
        description={formatMessage({
          defaultMessage:
            "Disables animations, such as animated username effects. When off, animations follow your browser's reduced motion preference.",
        })}
        value={reducedMotion}
        onChange={setReducedMotion}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Accessibility, {
  settingPanelId: SettingPanelIds.ACCESSIBILITY,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Accessibility;
