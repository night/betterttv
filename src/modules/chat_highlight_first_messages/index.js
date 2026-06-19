import {PlatformTypes, SettingIds} from '@/constants';
import settings from '@/settings';
import {loadModuleForPlatforms} from '@/utils/modules';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

const CHAT_LINE_SELECTOR = '.chat-line__message';
const FIRST_MESSAGE_CLASS = 'bttv-highlight-first-message';

function markFirstMessage(node, isFirstMsg) {
  if (isFirstMsg && settings.get(SettingIds.HIGHLIGHT_FIRST_TIME_CHATTERS)) {
    node.classList.add(FIRST_MESSAGE_CLASS);
  } else {
    node.classList.remove(FIRST_MESSAGE_CLASS);
  }
}

class ChatHighlightFirstMessagesModule {
  constructor() {
    watcher.on('chat.message', (node, messageObj) => this.onMessage(node, messageObj));
    settings.on(`changed.${SettingIds.HIGHLIGHT_FIRST_TIME_CHATTERS}`, () => this.rescan());
  }

  onMessage(node, messageObj) {
    markFirstMessage(node, messageObj?.isFirstMsg === true);
  }

  // re-evaluate already-rendered messages when the setting is toggled
  rescan() {
    for (const node of document.querySelectorAll(CHAT_LINE_SELECTOR)) {
      const messageObj = twitch.getChatMessageObject(node);
      markFirstMessage(node, messageObj?.isFirstMsg === true);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatHighlightFirstMessagesModule()]);
