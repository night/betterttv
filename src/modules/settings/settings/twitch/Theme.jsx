import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingDefaultValues, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingPrimaryColorRadio from '@/modules/settings/components/SettingPrimaryColorRadio';
import useProRequiredState from '@/common/hooks/ProRequiredState';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

function Theme(props, ref) {
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
        name={formatMessage({defaultMessage: 'Dark theme'})}
        description={formatMessage({defaultMessage: 'Use a dark color scheme.'})}
        value={darkThemeValue}
        onChange={setDarkThemeValue}
        disabled={autoThemeValue}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Auto theme'})}
        description={formatMessage({
          defaultMessage: "Automatically set dark theme from your system's theme.",
        })}
        value={autoThemeValue}
        onChange={setAutoThemeValue}
      />
      <SettingPrimaryColorRadio
        showProBadge
        showBetaBadge
        value={normalizedThemeColorValue}
        onChange={setNormalizedThemeColorValue}
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
  keywords: ['dark', 'mode', 'light', 'theme', 'white', 'black'],
});

export default React.forwardRef(Theme);
