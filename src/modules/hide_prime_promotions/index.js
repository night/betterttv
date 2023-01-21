import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';

class HidePrimePromotionsModule {
  constructor() {
    settings.on(`changed.${SettingIds.PRIME_PROMOTIONS}`, this.togglePrimePromotions);
    watcher.on('load', this.togglePrimePromotions);
  }

  togglePrimePromotions() {
    document.body.classList.toggle('bttv-hide-prime-promotions', !settings.get(SettingIds.PRIME_PROMOTIONS));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HidePrimePromotionsModule()]);
