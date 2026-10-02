import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';
import styles from './styles.module.css';

class HideAISummaryModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(
      styles.hideAiSummary,
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.AI_STREAM_SUMMARY)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideAISummaryModule()]);
