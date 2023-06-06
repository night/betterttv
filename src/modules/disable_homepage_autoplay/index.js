import {AutoPlayFlags, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

class DisableHomepageAutoplayModule {
  constructor() {
    watcher.on('load.homepage', () => this.load());
  }

  load() {
    if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.FP_VIDEO)) return;
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;

    const prevMuted = currentPlayer.isMuted();

    currentPlayer.setMuted(true);

    const stopAutoplay = () => {
      setTimeout(() => {
        currentPlayer.pause();
        currentPlayer.setMuted(prevMuted);
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

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableHomepageAutoplayModule()]);
