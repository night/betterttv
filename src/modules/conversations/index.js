import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';
import chat from '../chat/index.js';

const CHAT_USER_SELECTOR = '.thread-message__message--user-name';
const CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';
const SCROLL_CONTAINER_SELECTOR = '.simplebar-scroll-content';

function scrollOnEmoteLoad(el) {
  el.querySelectorAll('img').forEach((image) => {
    image.addEventListener('load', () => {
      const scrollContainer = image.closest(SCROLL_CONTAINER_SELECTOR);
      if (scrollContainer == null) return;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });
  });
}

class ConversationsModule {
  constructor() {
    settings.on(`changed.${SettingIds.WHISPERS}`, () => this.toggleHide());
    watcher.on('load', () => this.toggleHide());
    watcher.on('conversation.message', (threadId, el, message) => this.parseMessage(el, message));
  }

  toggleHide() {
    document.body.classList.toggle('bttv-hide-conversations', !settings.get(SettingIds.WHISPERS));
  }

  parseMessage(element, message) {
    if (!message.from) return;
    const {id, login: name, displayName, chatColor: color} = message.from;
    const mockUser = {
      id,
      name,
      displayName,
      color,
    };

    const from = element.querySelector(CHAT_USER_SELECTOR);
    if (from != null) {
      from.style.color = chat.calculateColor(mockUser.color);
    }

    chat.messageReplacer(element.querySelectorAll(CHAT_MESSAGE_SELECTOR), mockUser);

    scrollOnEmoteLoad(element);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ConversationsModule()]);
