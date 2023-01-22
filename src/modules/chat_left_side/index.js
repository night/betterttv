import {ChatLayoutTypes, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class ChatLeftSide {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT_LAYOUT}`, () => this.toggleLeftSideChat());
    this.toggleLeftSideChat();
  }

  toggleLeftSideChat() {
    document.body.classList.toggle('bttv-swap-chat', settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT);

    // TODO: replace this eventually when :has exists in CSS
    const sideNav = document.querySelector('.side-nav')?.parentElement;
    const main = document.querySelector('.twilight-main');
    if (sideNav != null && main != null && sideNav.parentElement === main.parentElement) {
      sideNav.classList.add('bttv-side-nav');
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatLeftSide()]);
