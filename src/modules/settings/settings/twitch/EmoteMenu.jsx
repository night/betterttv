import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {EMOTE_MENU_MIN_WIDTH} from '@/common/stores/emote-menu-view-store';
import {SettingIds, EmoteMenuTypes, SettingDefaultValues} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingNumberInput from '@/modules/settings/components/SettingNumberInput';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});

function EmoteMenu({ref, ...props}) {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_MENU);
  const [width, setWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH);
  const toggled = value !== EmoteMenuTypes.NONE;

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: "Use BetterTTV's emote menu"})}
        description={formatMessage({defaultMessage: 'A fuller picker for chat, with search and categories.'})}
        value={toggled}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.NONE)}
      />
      <SettingSwitch
        disabled={!toggled}
        name={formatMessage({defaultMessage: 'Replace the native emote menu button'})}
        description={formatMessage({defaultMessage: "Opens BetterTTV's emote menu in place of Twitch's."})}
        value={value === EmoteMenuTypes.ENABLED}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.LEGACY_ENABLED)}
      />
      <SettingNumberInput
        disabled={!toggled}
        name={formatMessage({defaultMessage: 'Set a maximum width'})}
        description={formatMessage({defaultMessage: 'Measured in pixels.'})}
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
  settingCategoryId: SettingCategoryIds.EMOTES,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
});

export default EmoteMenu;
