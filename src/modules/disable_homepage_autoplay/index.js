import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {AutoPlayFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

class DisableHomepageAutoplayModule {
  constructor() {
    watcher.on('load.homepage', () => this.load());
  }

  load() {
    if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.FP_VIDEO)) return;
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;

    const stopAutoplay = () => {
      setTimeout(() => {
        currentPlayer.pause();
      }, 0);
      if (currentPlayer.emitter) {
        currentPlayer.emitter.removeListener('Playing', stopAutoplay);
      } else {
        currentPlayer.removeEventListener('play', stopAutoplay);
      }
    };

    if (currentPlayer.emitter) {
      currentPlayer.pause();
      currentPlayer.emitter.on('Playing', stopAutoplay);
    } else {
      currentPlayer.addEventListener('play', stopAutoplay);
    }
  }
}

export default new DisableHomepageAutoplayModule();
