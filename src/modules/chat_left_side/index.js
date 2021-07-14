import $ from 'jquery';
import {ChatLayoutTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';

class ChatLeftSide {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT_LAYOUT}`, () => this.toggleLeftSideChat());
    this.toggleLeftSideChat();
  }

  toggleLeftSideChat() {
    $('body').toggleClass('bttv-swap-chat', settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT);
  }
}

export default new ChatLeftSide();
