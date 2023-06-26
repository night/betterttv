import {ChatFlags, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class HideHypeChatModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle('bttv-hide-hypechat', !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.HYPECHAT));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideHypeChatModule()]);
