import chat from '../chat/index.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import {EmoteTypeFlags, PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {hasFlag} from '../../utils/flags.js';

const CHAT_MESSAGE_SELECTOR = '.chat-entry-content';
const CHAT_BADGES_CONTAINER_SELECTOR = '#chat-badges';

class KickModule {
  constructor() {
    watcher.on('load.kick', () => this.load());
    watcher.on('kick.message', (el, messageObj) => this.parseMessage(el, messageObj));
  }

  load() {}

  parseMessage(element) {
    /* Only has global emote support currently */
    const mockUser = {
      id: null,
      name: null,
      displayName: null,
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

export default loadModuleForPlatforms([PlatformTypes.KICK, () => new KickModule()]);
