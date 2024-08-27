import {ChatLayoutTypes, PlatformTypes, SettingIds} from '../../constants.js';
import dom from '../../observers/dom.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const SIDE_NAV_SELECTOR = '.side-nav';

class ChatLeftSide {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT_LAYOUT}`, () => this.toggleLeftSideChat());
    dom.on(SIDE_NAV_SELECTOR, () => this.toggleLeftSideChat());
    this.toggleLeftSideChat();
  }

  toggleLeftSideChat() {
    document.body.classList.toggle('bttv-swap-chat', settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT);

    const sideNav = document.querySelector(SIDE_NAV_SELECTOR)?.parentElement;
    const main = document.querySelector('.twilight-main');
    if (sideNav != null && main != null && sideNav.parentElement === main.parentElement) {
      sideNav.classList.add('bttv-side-nav');
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatLeftSide()]);
