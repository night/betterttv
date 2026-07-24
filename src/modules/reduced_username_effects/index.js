import effects from '@/common/styles/UsernameEffects.module.css';
import {PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {loadModuleForPlatforms} from '@/utils/modules';
import watcher from '@/watcher';

class ReducedUsernameEffectsModule {
  constructor() {
    settings.on(`changed.${SettingIds.REDUCED_USERNAME_EFFECTS}`, () => this.load());
    watcher.on('load.chat', () => this.load());
  }

  load() {
    document.body.classList.toggle(effects.reducedMotion, settings.get(SettingIds.REDUCED_USERNAME_EFFECTS));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ReducedUsernameEffectsModule()]);
