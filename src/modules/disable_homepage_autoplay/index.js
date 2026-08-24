import {AutoPlayFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const FEATURED_VIDEO_SELECTOR = 'div[data-test-selector="featured-item-video"]';

class DisableHomepageAutoplayModule {
  constructor() {
    watcher.on('load.homepage', () => this.load());
  }

  load() {
    if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.FP_VIDEO)) {
      return;
    }

    if (document.querySelector(FEATURED_VIDEO_SELECTOR) == null) {
      return;
    }

    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) {
      return;
    }

    const prevMuted = currentPlayer.isMuted();

    currentPlayer.setMuted(true);

    const stopAutoplay = () => {
      setTimeout(() => {
        // this listener only removes itself once it fires, so it can outlive the featured video
        // and end up pausing the player of whatever page was navigated to afterwards
        if (document.querySelector(FEATURED_VIDEO_SELECTOR) != null) {
          currentPlayer.pause();
        }

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
