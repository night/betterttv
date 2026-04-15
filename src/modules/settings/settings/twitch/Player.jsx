import React from 'react';
import useStorageState from '../../../../common/hooks/StorageState.jsx';
import {SettingIds} from '../../../../constants.js';
import formatMessage from '../../../../i18n/index.js';
import SettingStore, {SettingPanelIds} from '../../stores/SettingStore.jsx';
import SettingSwitch from '../../components/SettingSwitch.jsx';
import SettingGroup from '../../components/SettingGroup.jsx';

const SETTING_NAME = formatMessage({defaultMessage: 'Player'});

function Player(props, ref) {
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

SettingStore.registerSetting(React.forwardRef(Player), {
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

export default React.forwardRef(Player);
