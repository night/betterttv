import {PlatformTypes} from '../../constants.js';
import colors from '../../utils/colors.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import watcher from '../../watcher.js';
import chat from '../chat/index.js';

const CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';
const CHAT_USERNAME_SELECTOR = 'a[href$="/clips"] span';
const SCROLL_INDICATOR_SELECTOR = '.clips-chat .clips-chat__content button';
const SCROLL_CONTAINER_SELECTOR = '.clips-chat .simplebar-scroll-content';

function scrollOnEmoteLoad(el) {
  const indicator = document.querySelector(SCROLL_INDICATOR_SELECTOR) != null;
  if (indicator) return;

  el.querySelectorAll('img').forEach((image) => {
    image.addEventListener('load', () => {
      const scrollContainer = document.querySelector(SCROLL_CONTAINER_SELECTOR);
      if (scrollContainer == null) return;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });
  });
}

class ClipsModule {
  constructor() {
    watcher.on('clips.message', (el) => this.parseMessage(el));
  }

  parseMessage(element) {
    const from = element.querySelector(CHAT_USERNAME_SELECTOR);
    const colorSpan = from?.closest('a')?.closest('span');

    if (colorSpan != null && colorSpan.style.color) {
      const oldColor = colors.getHex(colors.getRgb(colorSpan.style.color));
      colorSpan.style.color = chat.calculateColor(oldColor);
    }

    const mockUser = {name: from.textContent};
    chat.messageReplacer(element.querySelector(CHAT_MESSAGE_SELECTOR), mockUser);

    scrollOnEmoteLoad(element);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH_CLIPS, () => new ClipsModule()]);
