import {ChatLayoutTypes, PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {loadModuleForPlatforms} from '@/utils/modules';

class ChatLeftSide {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT_LAYOUT}`, () => this.toggleLeftSideChat());
    this.toggleLeftSideChat();
  }

  toggleLeftSideChat() {
    document.body.classList.toggle('bttv-swap-chat', settings.get(SettingIds.CHAT_LAYOUT) === ChatLayoutTypes.LEFT);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatLeftSide()]);
