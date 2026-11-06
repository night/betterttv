import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import {registerSearchEntry} from '@/modules/settings/search-entries';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Player'});
const CLICK_TO_PLAY_NAME = formatMessage({defaultMessage: 'Click to Play'});
const CLICK_TO_PLAY_DESCRIPTION = formatMessage({defaultMessage: 'Clicking the player will pause/resume playback.'});
const MUTE_INVISIBLE_PLAYER_NAME = formatMessage({defaultMessage: 'Mute Invisible Player'});
const MUTE_INVISIBLE_PLAYER_DESCRIPTION = formatMessage({
  defaultMessage: 'Toggle sound when you change browser tab or window.',
});
const PLAYER_EXTENSIONS_NAME = formatMessage({defaultMessage: 'Player Extensions'});
const PLAYER_EXTENSIONS_DESCRIPTION = formatMessage({
  defaultMessage: "Show the interactive overlays on top of Twitch's video player.",
});
const SCROLL_PLAYER_CONTROLS_NAME = formatMessage({defaultMessage: 'Scroll Player Controls'});
const SCROLL_PLAYER_CONTROLS_DESCRIPTION = formatMessage({
  defaultMessage: 'Enable scrolling to change the player volume. Hold ALT when scrolling to seek.',
});
const AUTO_THEATRE_MODE_NAME = formatMessage({defaultMessage: 'Auto Theatre Mode'});
const AUTO_THEATRE_MODE_DESCRIPTION = formatMessage({defaultMessage: 'Enable theatre mode when possible.'});

function Player({ref, ...props}) {
  const [clickToPlay, setClickToPlay] = useStorageState(SettingIds.CLICK_TO_PLAY);
  const [muteInvisiblePlayer, setMuteInvisiblePlayer] = useStorageState(SettingIds.MUTE_INVISIBLE_PLAYER);
  const [playerExtensions, setPlayerExtensions] = useStorageState(SettingIds.PLAYER_EXTENSIONS);
  const [scrollPlayerControls, setScrollPlayerControls] = useStorageState(SettingIds.SCROLL_PLAYER_CONTROLS);
  const [autoTheatreMode, setAutoTheatreMode] = useStorageState(SettingIds.AUTO_THEATRE_MODE);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={CLICK_TO_PLAY_NAME}
        description={CLICK_TO_PLAY_DESCRIPTION}
        value={clickToPlay}
        onChange={setClickToPlay}
      />
      <SettingSwitch
        name={MUTE_INVISIBLE_PLAYER_NAME}
        description={MUTE_INVISIBLE_PLAYER_DESCRIPTION}
        value={muteInvisiblePlayer}
        onChange={setMuteInvisiblePlayer}
      />
      <SettingSwitch
        name={PLAYER_EXTENSIONS_NAME}
        description={PLAYER_EXTENSIONS_DESCRIPTION}
        value={playerExtensions}
        onChange={setPlayerExtensions}
      />
      <SettingSwitch
        name={SCROLL_PLAYER_CONTROLS_NAME}
        description={SCROLL_PLAYER_CONTROLS_DESCRIPTION}
        value={scrollPlayerControls}
        onChange={setScrollPlayerControls}
      />
      <SettingSwitch
        name={AUTO_THEATRE_MODE_NAME}
        description={AUTO_THEATRE_MODE_DESCRIPTION}
        value={autoTheatreMode}
        onChange={setAutoTheatreMode}
      />
    </SettingGroup>
  );
}

registerSearchEntry({
  query: CLICK_TO_PLAY_NAME,
  description: CLICK_TO_PLAY_DESCRIPTION,
  settingPanelId: SettingPanelIds.PLAYER,
});

registerSearchEntry({
  query: MUTE_INVISIBLE_PLAYER_NAME,
  description: MUTE_INVISIBLE_PLAYER_DESCRIPTION,
  settingPanelId: SettingPanelIds.PLAYER,
});

registerSearchEntry({
  query: PLAYER_EXTENSIONS_NAME,
  description: PLAYER_EXTENSIONS_DESCRIPTION,
  settingPanelId: SettingPanelIds.PLAYER,
});

registerSearchEntry({
  query: SCROLL_PLAYER_CONTROLS_NAME,
  description: SCROLL_PLAYER_CONTROLS_DESCRIPTION,
  settingPanelId: SettingPanelIds.PLAYER,
});

registerSearchEntry({
  query: AUTO_THEATRE_MODE_NAME,
  description: AUTO_THEATRE_MODE_DESCRIPTION,
  settingPanelId: SettingPanelIds.PLAYER,
});

SettingStore.registerSetting(Player, {
  settingPanelId: SettingPanelIds.PLAYER,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default Player;
