import $ from 'jquery';
import {ChatLayoutTypes, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class ChatLeftSide {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT_LAYOUT}`, () => this.toggleLeftSideChat());
    this.toggleLeftSideChat();
  }

  toggleLeftSideChat() {
    $('body').toggleClass('bttv-swap-chat', settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT);

    // TODO: replace this eventually when :has exists in CSS
    if (settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT) {
      const sideNav = $('.side-nav').parent();
      const main = $('.twilight-main');
      if (sideNav.parent()[0] === main.parent()[0]) {
        sideNav.css({order: 3});
      }
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatLeftSide()]);
