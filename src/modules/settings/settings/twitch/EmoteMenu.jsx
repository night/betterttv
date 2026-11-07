import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {EMOTE_MENU_MIN_WIDTH} from '@/common/stores/emote-menu-view-store';
import {SettingIds, EmoteMenuTypes, SettingDefaultValues} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingNumberInput from '@/modules/settings/components/SettingNumberInput';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});
const USE_BETTERTTVS_EMOTE_MENU_NAME = formatMessage({defaultMessage: "Use BetterTTV's emote menu"});
const USE_BETTERTTVS_EMOTE_MENU_DESCRIPTION = formatMessage({
  defaultMessage: 'Enables a more advanced emote menu for chat.',
});
const REPLACE_THE_NATIVE_EMOTE_MENU_BUTTON_NAME = formatMessage({
  defaultMessage: 'Replace the native emote menu button',
});
const REPLACE_THE_NATIVE_EMOTE_MENU_BUTTON_DESCRIPTION = formatMessage({
  defaultMessage: "Replace Twitch's native emote menu.",
});
const MAX_WIDTH_NAME = formatMessage({defaultMessage: 'Max Width'});
const MAX_WIDTH_DESCRIPTION = formatMessage({defaultMessage: 'Maximum width of the emote menu, measured in pixels.'});

function EmoteMenu({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_MENU);
  const [width, setWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH);
  const toggled = value !== EmoteMenuTypes.NONE;

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={USE_BETTERTTVS_EMOTE_MENU_NAME}
        description={USE_BETTERTTVS_EMOTE_MENU_DESCRIPTION}
        value={toggled}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.NONE)}
      />
      <SettingSwitch
        disabled={!toggled}
        name={REPLACE_THE_NATIVE_EMOTE_MENU_BUTTON_NAME}
        description={REPLACE_THE_NATIVE_EMOTE_MENU_BUTTON_DESCRIPTION}
        value={value === EmoteMenuTypes.ENABLED}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.LEGACY_ENABLED)}
      />
      <SettingNumberInput
        disabled={!toggled}
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

registerSearchEntry({
  query: USE_BETTERTTVS_EMOTE_MENU_NAME,
  description: USE_BETTERTTVS_EMOTE_MENU_DESCRIPTION,
  keywords: ['bttv'],
  settingPanelId: SettingPanelIds.EMOTE_MENU,
});

registerSearchEntry({
  query: REPLACE_THE_NATIVE_EMOTE_MENU_BUTTON_NAME,
  description: REPLACE_THE_NATIVE_EMOTE_MENU_BUTTON_DESCRIPTION,
  settingPanelId: SettingPanelIds.EMOTE_MENU,
});

registerSearchEntry({
  query: MAX_WIDTH_NAME,
  description: MAX_WIDTH_DESCRIPTION,
  settingPanelId: SettingPanelIds.EMOTE_MENU,
});

SettingStore.registerSetting(EmoteMenu, {
  settingPanelId: SettingPanelIds.EMOTE_MENU,
  settingCategoryId: SettingCategoryIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default EmoteMenu;
