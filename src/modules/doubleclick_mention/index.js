import $ from 'jquery';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';

const CHAT_ROOM_SELECTOR = '.chat-list,.chat-list--default,.chat-list--other';
const CHAT_TEXT_AREA = '.chat-input textarea';
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

class DoubleClickMentionModule {
  constructor() {
    watcher.on('load.chat', () => this.load());
  }

  load() {
    $(CHAT_ROOM_SELECTOR)
      .off('dblclick.mention')
      .on('dblclick.mention', USERNAME_SELECTORS, (e) => {
        if (e.shiftKey || e.ctrlKey) return;

        $('button[data-test-selector="close-viewer-card"]').click();

        clearSelection();
        let user = e.target.innerText ? e.target.innerText.replace('@', '') : '';
        const $target = $(e.target);
        const messageObj = twitch.getChatMessageObject($target.closest(CHAT_LINE_SELECTOR)[0]);
        if (messageObj && $target.attr('data-a-target') !== 'chat-message-mention') {
          user = messageObj.user.userLogin;
        }
        const $inputField = $(CHAT_TEXT_AREA);
        if (!$inputField.length) return;
        const input = $inputField.val().trim();
        const output = input ? `${input} @${user} ` : `@${user}, `;
        twitch.setInputValue($inputField, output, true);
      });
  }
}

export default new DoubleClickMentionModule();
