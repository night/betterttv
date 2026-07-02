import React from 'react';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import useStorageState from '@/common/hooks/StorageState';
import {SettingDefaultValues, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingPrimaryColorRadio from '@/modules/settings/components/SettingPrimaryColorRadio';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

const DARK_THEME_NAME = formatMessage({defaultMessage: 'Dark theme'});
const DARK_THEME_DESCRIPTION = formatMessage({defaultMessage: 'Use a dark color scheme.'});
const AUTO_THEME_NAME = formatMessage({defaultMessage: 'Auto theme'});
const AUTO_THEME_DESCRIPTION = formatMessage({
  defaultMessage: "Automatically set dark theme from your system's theme.",
});
const ACCENT_COLOR_NAME = formatMessage({defaultMessage: 'Accent Color'});
const ACCENT_COLOR_DESCRIPTION = formatMessage({defaultMessage: 'The primary accent color of the theme.'});

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
        name={DARK_THEME_NAME}
        description={DARK_THEME_DESCRIPTION}
        value={darkThemeValue}
        onChange={setDarkThemeValue}
        disabled={autoThemeValue}
      />
      <SettingSwitch
        name={AUTO_THEME_NAME}
        description={AUTO_THEME_DESCRIPTION}
        value={autoThemeValue}
        onChange={setAutoThemeValue}
      />
      <SettingPrimaryColorRadio
        showProBadge
        value={normalizedThemeColorValue}
        onChange={setNormalizedThemeColorValue}
        name={ACCENT_COLOR_NAME}
        description={ACCENT_COLOR_DESCRIPTION}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Theme, {
  settingPanelId: SettingPanelIds.THEME,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: DARK_THEME_NAME, description: DARK_THEME_DESCRIPTION},
  {name: AUTO_THEME_NAME, description: AUTO_THEME_DESCRIPTION},
  {name: ACCENT_COLOR_NAME, description: ACCENT_COLOR_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.THEME)});
}

export default Theme;
