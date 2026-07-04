import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import styles from './styles.module.css';

class HideCommunityHighlightsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(
      styles.hideCommunityHighlights,
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.COMMUNITY_HIGHLIGHTS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideCommunityHighlightsModule()]);
