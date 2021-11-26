import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {AutoPlayFlags, PlatformTypes, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class HomepageModule {
  constructor() {
    watcher.on('load.homepage', () => {
      this.toggleAutoPlay();
    });

    settings.on(`changed.${SettingIds.SHOW_HOMEPAGE_CAROUSEL}`, () => this.toggleCarousel());
    this.toggleCarousel();
  }

  toggleCarousel() {
    $('body').toggleClass('bttv-hide-homepage-carousel', !settings.get(SettingIds.SHOW_HOMEPAGE_CAROUSEL));
  }

  toggleAutoPlay() {
    if (hasFlag(settings.get(SettingIds.AUTO_PLAY), AutoPlayFlags.FP_VIDEO) && settings.get(SettingIds.SHOW_HOMEPAGE_CAROUSEL)) return;
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer) return;

    currentPlayer.setMuted(true);

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

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HomepageModule()]);
