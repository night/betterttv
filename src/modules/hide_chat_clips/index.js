import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';

class HideChatClipsModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, () => this.load());
    this.load();
  }

  load() {
    document.body.classList.toggle(
      'bttv-hide-chat-clips',
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_CLIPS)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideChatClipsModule()]);
