import $ from 'jquery';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import settings from '../../settings.js';
import {DeletedMessageTypes, PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';

const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_LINK_SELECTOR = 'a.link-fragment';
const CHAT_LINE_CLIP_CARD_SELECTOR = '.chat-card';
const CHAT_LINE_DELETED_CLASS = 'bttv-chat-line-deleted';

function findAllUserMessages(name, targetMessageId) {
  return Array.from(document.querySelectorAll(CHAT_LINE_SELECTOR)).filter((node) => {
    const message = twitch.getChatMessageObject(node);
    if (!message) {
      return false;
    }
    if (!$(node).is(':visible')) {
      return false;
    }
    if (node.classList.contains(CHAT_LINE_DELETED_CLASS)) {
      return false;
    }
    return message.user?.userLogin === name && (!targetMessageId || targetMessageId === message.id);
  });
}

class ChatDeletedMessagesModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => {
      this.handleMessage(message);
    });
  }

  handleMessage({message, preventDefault}) {
    switch (message.type) {
      case twitch.TMIActionTypes.CLEAR_CHAT:
        twitch.sendChatAdminMessage('Chat was cleared by a moderator (Prevented by BetterTTV)');
        preventDefault();
        break;
      case twitch.TMIActionTypes.MODERATION: {
        const userLogin = message.userLogin || message.user.userLogin;
        const targetMessageId = message.targetMessageID;
        if (this.handleDelete(userLogin, targetMessageId)) {
          preventDefault();
          // we still want to render moderation messages
          const chatBuffer = twitch.getChatBuffer();
          if (chatBuffer) {
            chatBuffer.state.messages.push(message);
            chatBuffer.onBufferUpdate();
          }
          // if messages are still in the buffer they might still render
          setTimeout(() => this.handleDelete(userLogin, targetMessageId), 250);
        }
        break;
      }
      default:
        break;
    }
  }

  handleDelete(name, targetMessageId) {
    const deletedMessages = settings.get(SettingIds.DELETED_MESSAGES);
    const showDeletedMessages = deletedMessages === DeletedMessageTypes.SHOW;
    const hideDeletedMessages = deletedMessages === DeletedMessageTypes.HIDE;
    if (!hideDeletedMessages && !showDeletedMessages) {
      return false;
    }
    const messages = findAllUserMessages(name, targetMessageId);
    messages.forEach((message) => {
      const $message = $(message);
      if (hideDeletedMessages) {
        $message.hide();
      } else if (showDeletedMessages) {
        $message.toggleClass(CHAT_LINE_DELETED_CLASS, true);
        /* eslint-disable-next-line func-names */
        $message.find(CHAT_LINE_LINK_SELECTOR).each(function () {
          const $link = $(this);
          $link.removeAttr('href');
        });
        $message.find(CHAT_LINE_CLIP_CARD_SELECTOR).remove();
      }
    });
    return true;
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatDeletedMessagesModule()]);
