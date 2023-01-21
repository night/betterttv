import {off, on} from 'delegated-events';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {PlatformTypes} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const CHAT_ROOM_SELECTOR = '.chat-list,.chat-list--default,.chat-list--other';
const CHAT_LINE_SELECTOR = '.chat-line__message';
const USERNAME_SELECTORS =
  '.chat-line__message span.chat-author__display-name, .chat-line__message span[data-a-target="chat-message-mention"]';

function clearSelection() {
  if (document.selection && document.selection.empty) {
    document.selection.empty();
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges();
  }
}

function handleDoubleClick(e) {
  if (e.shiftKey || e.ctrlKey) return;

  document.querySelector('button[data-test-selector="close-viewer-card"]')?.click();

  clearSelection();
  let user = e.target.innerText ? e.target.innerText.replace('@', '') : '';
  const messageObj = twitch.getChatMessageObject(e.target.closest(CHAT_LINE_SELECTOR));
  if (messageObj != null && e.target.getAttribute('data-a-target') !== 'chat-message-mention') {
    user = messageObj.user.userLogin;
  }
  const chatInputValue = twitch.getChatInputValue();
  if (chatInputValue == null) return;
  const input = chatInputValue.trim();
  const output = input ? `${input} @${user} ` : `@${user}, `;
  twitch.setChatInputValue(output, true);
}

class DoubleClickMentionModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
  }

  load() {
    const chatRoom = document.querySelector(CHAT_ROOM_SELECTOR);
    if (chatRoom == null) {
      return;
    }

    off('dblclick', USERNAME_SELECTORS, handleDoubleClick);
    on('dblclick', USERNAME_SELECTORS, handleDoubleClick);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new DoubleClickMentionModule()]);
