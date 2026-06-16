import {PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {loadModuleForPlatforms} from '@/utils/modules';
import watcher from '@/watcher';

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
