import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';

class HideBitsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle('bttv-hide-bits', !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.BITS));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideBitsModule()]);
