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
    const isEnabled = settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT;
    $('body').toggleClass('bttv-swap-chat', isEnabled);

    // TODO: replace this eventually when :has exists in CSS
    const sideNav = $('.side-nav').parent();
    const main = $('.twilight-main');
    if (sideNav.parent()[0] === main.parent()[0]) {
      sideNav.css({order: isEnabled ? 3 : 'unset'});
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatLeftSide()]);
