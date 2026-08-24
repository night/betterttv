import {AutoPlayFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const CAROUSEL_PLAYER_SELECTOR = '.video-player[data-a-player-type="channel_home_carousel"]';

class DisableOfflineChannelAutoplayModule {
  constructor() {
    watcher.on('load.player', () => this.load());
  }

  load() {
    if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.OFFLINE_CHANNEL_VIDEO)) return;
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || document.querySelector(CAROUSEL_PLAYER_SELECTOR) == null) {
      return;
    }

    const prevMuted = currentPlayer.isMuted();

    currentPlayer.setMuted(true);

    const stopAutoplay = () => {
      setTimeout(() => {
        // this listener only removes itself once it fires, so it can outlive the offline carousel
        // and end up pausing the player of a live channel navigated to afterwards
        if (document.querySelector(CAROUSEL_PLAYER_SELECTOR) != null) {
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

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DisableOfflineChannelAutoplayModule()]);
