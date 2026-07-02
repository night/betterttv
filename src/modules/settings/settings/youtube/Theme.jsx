import React from 'react';
import useProRequiredState from '@/common/hooks/ProRequiredState';
import useStorageState from '@/common/hooks/StorageState';
import {SettingDefaultValues, SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingPrimaryColorRadio from '@/modules/settings/components/SettingPrimaryColorRadio';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Theme'});

const ACCENT_COLOR_NAME = formatMessage({defaultMessage: 'Accent Color'});
const ACCENT_COLOR_DESCRIPTION = formatMessage({defaultMessage: 'The primary accent color of the theme.'});

function Theme({ref, ...props}) {
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

searchStore.registerSearchEntry({
  name: ACCENT_COLOR_NAME,
  description: ACCENT_COLOR_DESCRIPTION,
  goto: () => gotoSettingPanel(SettingPanelIds.THEME),
});

export default Theme;
