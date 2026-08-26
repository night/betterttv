import {CelebrationFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import styles from './styles.module.css';

class HideCelebrationsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CELEBRATIONS}`, () => this.load());
    this.load();
  }

  load() {
    const celebrations = settings.get(SettingIds.CELEBRATIONS);
    document.body.classList.toggle(styles.hideCelebrations, !hasFlag(celebrations, CelebrationFlags.CELEBRATIONS));
    document.body.classList.toggle(styles.hideCheerEffects, !hasFlag(celebrations, CelebrationFlags.CHEER_EFFECTS));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideCelebrationsModule()]);
