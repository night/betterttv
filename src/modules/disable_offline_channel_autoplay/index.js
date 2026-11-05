import {AutoPlayFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const OFFLINE_CAROUSEL_PLAYER_SELECTOR = '.video-player[data-a-player-type="channel_home_carousel"]';

class DisableOfflineChannelAutoplayModule {
  constructor() {
    this.cleanup = null;
    watcher.on('load.player', () => this.load());
  }

  load() {
    // twitch reuses the player across navigations, so a listener left over from an offline
    // channel would otherwise pause the next live stream once it starts playing
    this.cleanup?.();

    if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.OFFLINE_CHANNEL_VIDEO)) return;
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || document.querySelector(OFFLINE_CAROUSEL_PLAYER_SELECTOR) == null) {
      return;
    }

    const prevMuted = currentPlayer.isMuted();
    currentPlayer.setMuted(true);

    const removeListener = () => {
      if (currentPlayer.emitter) {
        currentPlayer.emitter.removeListener('Playing', stopAutoplay);
      } else {
        currentPlayer.removeEventListener('play', stopAutoplay);
      }
    };

    this.cleanup = () => {
      removeListener();
      currentPlayer.setMuted(prevMuted);
      this.cleanup = null;
    };

    const stopAutoplay = () => {
      removeListener();
      this.cleanup = null;

      if (document.querySelector(OFFLINE_CAROUSEL_PLAYER_SELECTOR) == null) {
        currentPlayer.setMuted(prevMuted);
        return;
      }

      setTimeout(() => {
        currentPlayer.pause();
        currentPlayer.setMuted(prevMuted);
      }, 0);
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
