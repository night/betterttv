import {SettingIds} from '../../constants.js';
import settings from '../../settings.js';

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

export default new SplitChatModule();
