import {ChatFlags, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {hasFlag} from '@/utils/flags';
import {loadModuleForPlatforms} from '@/utils/modules';

class ChatRepliesModule {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT}`, this.toggleChatReplies);
    this.toggleChatReplies();
  }

  toggleChatReplies() {
    document.body.classList.toggle(
      'bttv-hide-chat-replies',
      !hasFlag(settings.get(SettingIds.CHAT), ChatFlags.CHAT_REPLIES)
    );
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatRepliesModule()]);
