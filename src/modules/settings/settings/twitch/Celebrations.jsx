import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, CelebrationFlags} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingCheckbox from '@/modules/settings/components/SettingCheckbox';
import SettingCheckboxGroup from '@/modules/settings/components/SettingCheckboxGroup';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Celebrations'});

function Celebrations({ref, ...props}) {
  const [celebrations, setCelebrations] = useStorageState(SettingIds.CELEBRATIONS);

  return (
    <SettingCheckboxGroup
      ref={ref}
      {...props}
      name={SETTING_NAME}
      value={celebrations}
      onChange={setCelebrations}
      flags={Object.values(CelebrationFlags)}>
      <SettingCheckbox
        value={CelebrationFlags.CELEBRATIONS}
        name={formatMessage({defaultMessage: 'Celebrations'})}
        description={formatMessage({
          defaultMessage: 'Show on-screen channel celebration overlays, such as when a milestone is reached.',
        })}
      />
      <SettingCheckbox
        value={CelebrationFlags.CHEER_EFFECTS}
        name={formatMessage({defaultMessage: 'Cheer Effects'})}
        description={formatMessage({
          defaultMessage: 'Show on-screen confetti and particle effects from cheers and Power-ups.',
        })}
      />
    </SettingCheckboxGroup>
  );
}

SettingStore.registerSetting(Celebrations, {
  settingPanelId: SettingPanelIds.CELEBRATIONS,
  settingCategoryId: SettingCategoryIds.CHANNEL,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Celebrations;
