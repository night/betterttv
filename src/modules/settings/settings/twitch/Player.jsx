import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingCategoryIds, SettingPanelIds} from '@/modules/settings/stores/setting-store';

const SETTING_NAME = formatMessage({defaultMessage: 'Player'});

function Player({ref, ...props}) {
  const [clickToPlay, setClickToPlay] = useStorageState(SettingIds.CLICK_TO_PLAY);
  const [muteInvisiblePlayer, setMuteInvisiblePlayer] = useStorageState(SettingIds.MUTE_INVISIBLE_PLAYER);
  const [playerExtensions, setPlayerExtensions] = useStorageState(SettingIds.PLAYER_EXTENSIONS);
  const [scrollPlayerControls, setScrollPlayerControls] = useStorageState(SettingIds.SCROLL_PLAYER_CONTROLS);
  const [autoTheatreMode, setAutoTheatreMode] = useStorageState(SettingIds.AUTO_THEATRE_MODE);

  return (
    <SettingGroup ref={ref} {...props} name={SETTING_NAME}>
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Click to play'})}
        description={formatMessage({defaultMessage: 'Pauses and resumes when you click the video.'})}
        value={clickToPlay}
        onChange={setClickToPlay}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Mute when hidden'})}
        description={formatMessage({
          defaultMessage: 'Toggle sound when you change browser tab or window.',
        })}
        value={muteInvisiblePlayer}
        onChange={setMuteInvisiblePlayer}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Show player extensions'})}
        description={formatMessage({defaultMessage: "Interactive overlays on top of Twitch's video player."})}
        value={playerExtensions}
        onChange={setPlayerExtensions}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Scroll to control the player'})}
        description={formatMessage({
          defaultMessage: 'The mouse wheel changes the volume. Hold ALT while scrolling to seek.',
        })}
        value={scrollPlayerControls}
        onChange={setScrollPlayerControls}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Use theatre mode automatically'})}
        description={formatMessage({defaultMessage: 'Switches to the wider layout when possible.'})}
        value={autoTheatreMode}
        onChange={setAutoTheatreMode}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Player, {
  settingPanelId: SettingPanelIds.PLAYER,
  settingCategoryId: SettingCategoryIds.INTERFACE,
  name: SETTING_NAME,
});

export default Player;
