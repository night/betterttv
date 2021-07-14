import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {SettingIds} from '../../constants.js';

class AutoTheaterModeModule {
  constructor() {
    watcher.on('load.player', () => this.load());
  }

  load(tries = 1) {
    if (settings.get(SettingIds.AUTO_THEATRE_MODE) === false || tries > 3) return;

    const player = twitch.getCurrentPlayer();
    if (!player) return;

    // new Twitch channel layout does funky stuff with the video player in the background when on home screen
    if (
      $('div[data-a-player-type="channel_home_live"]').length > 0 ||
      $('.video-player__container--theatre').length > 0
    )
      return;

    try {
      player.setTheatre(true);
    } catch (_) {
      $('button[data-a-target="player-theatre-mode-button"]').click();
    }

    // hackfix: twitch's channel page experiment causes the player to load multiple times
    setTimeout(() => this.load(tries + 1), 1000);
  }
}

export default new AutoTheaterModeModule();
