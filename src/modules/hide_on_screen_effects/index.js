import {OnScreenEffectFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import styles from './styles.module.css';

class HideOnScreenEffectsModule {
  constructor() {
    settings.on(`changed.${SettingIds.ON_SCREEN_EFFECTS}`, () => this.load());
    this.load();
  }

  load() {
    const onScreenEffects = settings.get(SettingIds.ON_SCREEN_EFFECTS);
    document.body.classList.toggle(
      styles.hideOnScreenCelebrations,
      !hasFlag(onScreenEffects, OnScreenEffectFlags.ON_SCREEN_CELEBRATIONS)
    );
    document.body.classList.toggle(
      styles.hideHypeTrainAnimations,
      !hasFlag(onScreenEffects, OnScreenEffectFlags.HYPE_TRAIN_ANIMATIONS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideOnScreenEffectsModule()]);
