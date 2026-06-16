import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds, EmoteMenuTypes, SettingDefaultValues} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/SettingStore';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingNumberInput from '@/modules/settings/components/SettingNumberInput';
import {EMOTE_MENU_MIN_WIDTH} from '@/common/stores/emote-menu-view-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Emote Menu'});

function EmoteMenu(props, ref) {
  const [value, setValue] = useStorageState(SettingIds.EMOTE_MENU);
  const [width, setWidth] = useStorageState(SettingIds.EMOTE_MENU_WIDTH);
  const toggled = value !== EmoteMenuTypes.NONE;

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Emote Menu'})}
        description={formatMessage({defaultMessage: 'Enables a more advanced emote menu for chat.'})}
        value={toggled}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.NONE)}
      />
      <SettingSwitch
        disabled={!toggled}
        name={formatMessage({defaultMessage: 'Replace Native'})}
        description={formatMessage({defaultMessage: "Replace Twitch's native emote menu."})}
        value={value === EmoteMenuTypes.ENABLED}
        onChange={(state) => setValue(state ? EmoteMenuTypes.ENABLED : EmoteMenuTypes.LEGACY_ENABLED)}
      />
      <SettingNumberInput
        disabled={!toggled}
        name={formatMessage({defaultMessage: 'Max Width'})}
        description={formatMessage({defaultMessage: 'Maximum width of the emote menu, measured in pixels.'})}
        value={width}
        onChange={setWidth}
        placeholder={SettingDefaultValues[SettingIds.EMOTE_MENU_WIDTH]}
        min={EMOTE_MENU_MIN_WIDTH}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(React.forwardRef(EmoteMenu), {
  settingPanelId: SettingPanelIds.EMOTE_MENU,
  name: SETTING_NAME,
  supportsStandaloneWindow: true,
  keywords: ['emotes', 'popup'],
});

export default React.forwardRef(EmoteMenu);
