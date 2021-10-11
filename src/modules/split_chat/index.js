import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

let alternateBackground = false;

class SplitChatModule {
  render($el) {
    if (settings.get(SettingIds.SPLIT_CHAT) === false) return;

    if (alternateBackground) {
      $el.toggleClass('bttv-split-chat-alt-bg');
    }
    alternateBackground = !alternateBackground;
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SplitChatModule()]);
