import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';

class HideAISummaryModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(
      'bttv-hide-ai-summary',
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.AI_STREAM_SUMMARY)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideAISummaryModule()]);
