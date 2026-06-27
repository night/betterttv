import React from 'react';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingPrimaryColorRadio from '@/modules/settings/components/SettingPrimaryColorRadio';
import formatMessage from '@/i18n/index';
import {SettingDefaultValues, SettingIds} from '@/constants';
import useStorageState from '@/common/hooks/StorageState';
import useProRequiredState from '@/common/hooks/ProRequiredState';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

function Theme(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.PRIMARY_COLOR);

  const [normalizedValue, setNormalizedValue] = useProRequiredState({
    value: value,
    setValue: setValue,
    defaultValue: SettingDefaultValues[SettingIds.PRIMARY_COLOR],
  });

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingPrimaryColorRadio
        showProBadge
        value={normalizedValue}
        onChange={setNormalizedValue}
        name={formatMessage({defaultMessage: 'Accent Color'})}
        description={formatMessage({defaultMessage: 'The primary accent color of the theme.'})}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(Theme), {
  settingPanelId: SettingPanelIds.THEME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['primary', 'color', 'theme', 'accent'],
});

export default React.forwardRef(Theme);
