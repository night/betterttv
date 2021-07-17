import $ from 'jquery';
import {ChatFlags, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';

class ChatRepliesModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, this.toggleChatReplies);
    this.toggleChatReplies();
  }

  toggleChatReplies() {
    $('body').toggleClass('bttv-hide-chat-replies', !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_REPLIES));
  }
}

export default new ChatRepliesModule();
