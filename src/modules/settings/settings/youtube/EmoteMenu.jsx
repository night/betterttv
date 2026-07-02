import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {EMOTE_MENU_MIN_WIDTH} from '@/common/stores/emote-menu-view-store';
import {SettingIds, EmoteMenuTypes, SettingDefaultValues} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingNumberInput from '@/modules/settings/components/SettingNumberInput';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import searchStore from '@/modules/settings/stores/search-store';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';
import {gotoSettingPanel} from '@/modules/settings/stores/settings-navigation';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});
const SETTING_DESCRIPTION = formatMessage({defaultMessage: 'Enables a more advanced emote menu for chat.'});

const MAX_WIDTH_NAME = formatMessage({defaultMessage: 'Max Width'});
const MAX_WIDTH_DESCRIPTION = formatMessage({
  defaultMessage: 'Maximum width of the emote menu, measured in pixels.',
});

function EmoteMenu({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_MENU);
  const [width, setWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH);
  const isEnabled = value !== EmoteMenuTypes.NONE;

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={SETTING_NAME}
        description={SETTING_DESCRIPTION}
        value={isEnabled}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.NONE)}
      />
      <SettingNumberInput
        disabled={!isEnabled}
        name={MAX_WIDTH_NAME}
        description={MAX_WIDTH_DESCRIPTION}
        value={width}
        onChange={setWidth}
        placeholder={SettingDefaultValues[SettingIds.EMOTE_MENU_WIDTH]}
        min={EMOTE_MENU_MIN_WIDTH}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(EmoteMenu, {
  settingPanelId: SettingPanelIds.EMOTE_MENU,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

for (const entry of [
  {name: SETTING_NAME, description: SETTING_DESCRIPTION},
  {name: MAX_WIDTH_NAME, description: MAX_WIDTH_DESCRIPTION},
]) {
  searchStore.registerSearchEntry({...entry, goto: () => gotoSettingPanel(SettingPanelIds.EMOTE_MENU)});
}

export default EmoteMenu;
