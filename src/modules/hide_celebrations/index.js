import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import styles from './style.module.css';

class HideCelebrationsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(
      styles.hideCelebrations,
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CELEBRATIONS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideCelebrationsModule()]);
