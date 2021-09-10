import $ from 'jquery';
import chat from '../chat/index.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';

const GIF_EMOTES_SETTINGS_KEY = 'bttvGIFEmotes';
const CHAT_MESSAGE_SELECTOR = '#content #message,#content #content-text';
const CHAT_USERNAME_SELECTOR = '.yt-live-chat-author-chip,#author-text';

class YouTubeModule {
  constructor() {
    watcher.on('load.youtube', () => this.load());
    watcher.on('youtube.message', (el, messageObj) => this.parseMessage(el, messageObj));
  }

  load() {
    // force enable GIF emotes since clips does not have real settings
    if (settings.get(GIF_EMOTES_SETTINGS_KEY) === false) {
      settings.set(GIF_EMOTES_SETTINGS_KEY, true);
    }
  }

  parseMessage(element, messageObj) {
    const from = element.querySelector(CHAT_USERNAME_SELECTOR);
    const mockUser = {name: from.textContent};
    chat.messageReplacer($(element.querySelector(CHAT_MESSAGE_SELECTOR)), mockUser);
  }
}

export default new YouTubeModule();
