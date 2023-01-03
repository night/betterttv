import $ from 'jquery';
import chat from '../chat/index.js';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const CHAT_MESSAGE_SELECTOR = '#content #message,#content #content-text';
const CHAT_USERNAME_SELECTOR = '.yt-live-chat-author-chip,#author-text';

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
    const from = element.querySelector(CHAT_USERNAME_SELECTOR);
    const mockUser = {name: from.textContent};
    chat.messageReplacer($(element.querySelector(CHAT_MESSAGE_SELECTOR)), mockUser);
  }
}

export default loadModuleForPlatforms([PlatformTypes.YOUTUBE, () => new YouTubeModule()]);
