import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Accessibility'});
const REDUCE_MOTION_NAME = formatMessage({defaultMessage: 'Reduce Motion'});
const REDUCE_MOTION_DESCRIPTION = formatMessage({
  defaultMessage:
    "Disables animations, such as animated username effects. When off, animations follow your browser's reduced motion preference.",
});

function Accessibility({ref, ...props}) {
  const [reducedMotion, setReducedMotion] = useStorageState(SettingIds.REDUCED_MOTION);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={REDUCE_MOTION_NAME}
        description={REDUCE_MOTION_DESCRIPTION}
        value={reducedMotion}
        onChange={setReducedMotion}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: REDUCE_MOTION_NAME,
  description: REDUCE_MOTION_DESCRIPTION,
  settingPanelId: SettingPanelIds.ACCESSIBILITY,
});

SettingStore.registerSetting(Accessibility, {
  settingPanelId: SettingPanelIds.ACCESSIBILITY,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Accessibility;
