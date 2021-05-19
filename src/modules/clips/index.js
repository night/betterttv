import $ from 'jquery';
import chat from '../chat/index.js';
import colors from '../../utils/colors.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';

const GIF_EMOTES_SETTINGS_KEY = 'bttvGIFEmotes';
const CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';
const CHAT_USERNAME_SELECTOR = 'a[href$="/clips"] span';
const SCROLL_INDICATOR_SELECTOR = '.clips-chat .clips-chat__content button';
const SCROLL_CONTAINER_SELECTOR = '.clips-chat .simplebar-scroll-content';

function parseColor(rgbText) {
  const rgb = ((rgbText || '').split(')')[0].split('rgb(')[1] || '').split(',');
  const sanitize = (c) => parseInt(c.trim() || '0', 10);
  return {
    r: sanitize(rgb[0]),
    g: sanitize(rgb[1]),
    b: sanitize(rgb[2]),
  };
}

function scrollOnEmoteLoad($el) {
  const indicator = $(SCROLL_INDICATOR_SELECTOR).length > 0;
  if (indicator) return;
  $el.find('img').on('load', () => {
    const $scrollContainer = $(SCROLL_CONTAINER_SELECTOR);
    if ($scrollContainer.length === 0) return;
    $scrollContainer.scrollTop($scrollContainer[0].scrollHeight);
  });
}

class ClipsModule {
  constructor() {
    watcher.on('load.clips', () => this.load());
    watcher.on('clips.message', ($el) => this.parseMessage($el));
  }

  load() {
    // force enable GIF emotes since clips does not have real settings
    if (settings.get(GIF_EMOTES_SETTINGS_KEY) === false) {
      settings.set(GIF_EMOTES_SETTINGS_KEY, true);
    }
  }

  parseMessage($element) {
    const $from = $element.find(CHAT_USERNAME_SELECTOR);
    const $colorSpan = $from.closest('a').closest('span');

    if ($colorSpan.length && $colorSpan.css('color')) {
      const oldColor = colors.getHex(parseColor($from.css('color')));
      $colorSpan.attr('style', `color: ${chat.calculateColor(oldColor)}`);
    }

    const mockUser = {name: $from.text()};
    chat.messageReplacer($element.find(CHAT_MESSAGE_SELECTOR), mockUser);

    scrollOnEmoteLoad($element);
  }
}

export default new ClipsModule();
