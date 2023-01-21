import chat from '../chat/index.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import {EmoteTypeFlags, PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {hasFlag} from '../../utils/flags.js';

const CHAT_MESSAGE_SELECTOR = '#content #message,#content #content-text';
const CHAT_BADGES_CONTAINER_SELECTOR = '#chat-badges';

class YouTubeModule {
  constructor() {
    watcher.on('load.youtube', () => this.load());
    settings.on(`changed.${SettingIds.AUTO_LIVE_CHAT_VIEW}`, () => this.load());
    watcher.on('youtube.message', (el, messageObj) => this.parseMessage(el, messageObj));
  }

  load() {
    if (settings.get(SettingIds.AUTO_LIVE_CHAT_VIEW)) {
      document.querySelector('#live-chat-view-selector-sub-menu #trigger')?.click();
      document.querySelector('#live-chat-view-selector-sub-menu #dropdown a:nth-child(2)')?.click();
    }
  }

  parseMessage(element) {
    const message = element.__data?.data;
    const mockUser = {
      id: message?.authorExternalChannelId,
      name: message?.authorExternalChannelId,
      displayName: message?.authorName?.simpleText,
    };

    const emotesSettingValue = settings.get(SettingIds.EMOTES);
    const handleAnimatedEmotes =
      !hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_PERSONAL_EMOTES) ||
      !hasFlag(emotesSettingValue, EmoteTypeFlags.ANIMATED_EMOTES);
    if (handleAnimatedEmotes) {
      element.addEventListener('mousemove', chat.handleEmoteMouseEvent);
    }

    const customBadges = chat.customBadges(mockUser);
    const badgesContainer = element.querySelector(CHAT_BADGES_CONTAINER_SELECTOR);
    if (
      customBadges.length > 0 &&
      badgesContainer != null &&
      element.getElementsByClassName(customBadges[0].className)[0] == null
    ) {
      for (const badge of customBadges) {
        badgesContainer.after(badge);
      }
    }

    chat.messageReplacer(element.querySelector(CHAT_MESSAGE_SELECTOR), mockUser);
  }
}

export default loadModuleForPlatforms([PlatformTypes.YOUTUBE, () => new YouTubeModule()]);
