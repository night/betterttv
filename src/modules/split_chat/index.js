import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

let alternateBackground = false;
const DEFAULT_LIGHT_THEME_COLOR = '#dcdcdc';
const DEFAULT_DARK_THEME_COLOR = '#1f1925';

class SplitChatModule {
  render($el) {
    if (settings.get(SettingIds.SPLIT_CHAT) === false) return;

    if (alternateBackground) {
      $el.toggleClass('bttv-split-chat-alt-bg');

      const backgroundColor = settings.get(SettingIds.SPLIT_CHAT_COLOR);
      if (backgroundColor != null) {
        $el.css({'background-color': backgroundColor});
      }
    }
    alternateBackground = !alternateBackground;
  }

  getDefaultColor() {
    return document.querySelector('.tw-root--theme-dark') != null
      ? DEFAULT_DARK_THEME_COLOR
      : DEFAULT_LIGHT_THEME_COLOR;
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new SplitChatModule()]);
