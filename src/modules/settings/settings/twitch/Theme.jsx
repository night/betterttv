import React from 'react';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import useStorageState from '@/common/hooks/StorageState';
import {SettingDefaultValues, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingPrimaryColorRadio from '@/modules/settings/components/SettingPrimaryColorRadio';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

function Theme({ref, ...props}) {
  const [darkThemeValue, setDarkThemeValue] = useStorageState(SettingIds.DARKENED_MODE);
  const [autoThemeValue, setAutoThemeValue] = useStorageState(SettingIds.AUTO_THEME_MODE);
  const [themeColorValue, setThemeColorValue] = useStorageState(SettingIds.PRIMARY_COLOR);

  const [normalizedThemeColorValue, setNormalizedThemeColorValue] = useProRequiredState({
    value: themeColorValue,
    setValue: setThemeColorValue,
    defaultValue: SettingDefaultValues[SettingIds.PRIMARY_COLOR],
  });

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Use a dark theme'})}
        description={formatMessage({defaultMessage: 'Easier on the eyes in low light.'})}
        value={darkThemeValue}
        onChange={setDarkThemeValue}
        disabled={autoThemeValue}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Match your system'})}
        description={formatMessage({
          defaultMessage: "Automatically set dark theme from your system's theme.",
        })}
        value={autoThemeValue}
        onChange={setAutoThemeValue}
      />
      <SettingPrimaryColorRadio
        showProBadge
        value={normalizedThemeColorValue}
        onChange={setNormalizedThemeColorValue}
        name={formatMessage({defaultMessage: 'Pick an accent color'})}
        description={formatMessage({defaultMessage: 'Used for buttons, toggles and highlights across BetterTTV.'})}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Theme, {
  settingPanelId: SettingPanelIds.THEME,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default Theme;
