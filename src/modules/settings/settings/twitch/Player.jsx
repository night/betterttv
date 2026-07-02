import React from 'react';
import useStorageState from '@/common/hooks/StorageState';
import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import SettingGroup from '@/modules/settings/components/SettingGroup';
import SettingSwitch from '@/modules/settings/components/SettingSwitch';
import SettingStore, {SettingPanelIds} from '@/modules/settings/stores/setting-store';

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
        name={formatMessage({defaultMessage: 'Click to Play'})}
        description={formatMessage({defaultMessage: 'Clicking the player will pause/resume playback.'})}
        value={clickToPlay}
        onChange={setClickToPlay}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Mute Invisible Player'})}
        description={formatMessage({
          defaultMessage: 'Toggle sound when you change browser tab or window.',
        })}
        value={muteInvisiblePlayer}
        onChange={setMuteInvisiblePlayer}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Player Extensions'})}
        description={formatMessage({defaultMessage: "Show the interactive overlays on top of Twitch's video player."})}
        value={playerExtensions}
        onChange={setPlayerExtensions}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Scroll Player Controls'})}
        description={formatMessage({
          defaultMessage: 'Enable scrolling to change the player volume. Hold ALT when scrolling to seek.',
        })}
        value={scrollPlayerControls}
        onChange={setScrollPlayerControls}
      />
      <SettingSwitch
        name={formatMessage({defaultMessage: 'Auto Theatre Mode'})}
        description={formatMessage({defaultMessage: 'Enable theatre mode when possible.'})}
        value={autoTheatreMode}
        onChange={setAutoTheatreMode}
      />
    </SettingGroup>
  );
}

SettingStore.registerSetting(Player, {
  settingPanelId: SettingPanelIds.PLAYER,
  name: SETTING_NAME,
  keywords: [
    'click',
    'play',
    'mute',
    'invisible',
    'player',
    'video',
    'extensions',
    'addons',
    'volume',
    'seek',
    'control',
    'scroll',
    'auto',
    'theatre',
    'mode',
  ],
});

export default Player;
