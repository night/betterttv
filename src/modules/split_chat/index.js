import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

let alternateBackground = false;
const DEFAULT_LIGHT_THEME_COLOR = '#dcdcdc';
const DEFAULT_DARK_THEME_COLOR = '#1f1925';

class SplitChatModule {
  render(el, msgObject = {}) {
    if (settings.get(SettingIds.SPLIT_CHAT) === false) {
      return;
    }

    const oldAlternateBackground = msgObject.__bttvAlternateBackground;
    if (oldAlternateBackground == null) {
      msgObject.__bttvAlternateBackground = alternateBackground;
    }

    if (msgObject.__bttvAlternateBackground) {
      el.classList.add('bttv-split-chat-alt-bg');

      const backgroundColor = settings.get(SettingIds.SPLIT_CHAT_COLOR);
      if (backgroundColor != null && !el.style.backgroundColor) {
        el.style.backgroundColor = backgroundColor;
      }
    }

    // only alternate for new messages
    if (oldAlternateBackground == null) {
      alternateBackground = !alternateBackground;
    }
  }

  getDefaultColor() {
    return document.querySelector('.tw-root--theme-dark') != null
      ? DEFAULT_DARK_THEME_COLOR
      : DEFAULT_LIGHT_THEME_COLOR;
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SplitChatModule()]);
