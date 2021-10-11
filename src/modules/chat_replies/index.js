import $ from 'jquery';
import {ChatFlags, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

class ChatRepliesModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, this.toggleChatReplies);
    this.toggleChatReplies();
  }

  toggleChatReplies() {
    $('body').toggleClass('bttv-hide-chat-replies', !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_REPLIES));
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatRepliesModule()]);
