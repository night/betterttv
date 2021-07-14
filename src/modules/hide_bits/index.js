import $ from 'jquery';
import {ChatFlags, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';

class HideBitsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    $('body').toggleClass('bttv-hide-bits', !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.BITS));
  }
}

export default new HideBitsModule();
