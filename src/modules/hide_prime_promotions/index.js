import $ from 'jquery';
import {SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';

class HidePrimePromotionsModule {
  constructor() {
    settings.on(`changed.${SettingIds.PRIME_PROMOTIONS}`, this.togglePrimePromotions);
    watcher.on('load', this.togglePrimePromotions);
  }

  togglePrimePromotions() {
    $('body').toggleClass('bttv-hide-prime-promotions', !settings.get(SettingIds.PRIME_PROMOTIONS));
  }
}

export default new HidePrimePromotionsModule();
