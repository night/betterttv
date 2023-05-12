import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import settings from '../../settings.js';
import {DeletedMessageTypes, PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import ChatHighlightBlacklistKeywords from '../chat_highlight_blacklist_keywords/index.js';
import formatMessage from '../../i18n/index.js';
import domObserver from '../../observers/dom.js';

const CHAT_LINE_SELECTOR = '.chat-line__message';
const CHAT_LINE_LINK_SELECTOR = 'a.link-fragment';
const CHAT_LINE_CLIP_CARD_SELECTOR = '.chat-card';
const CHAT_LINE_DELETED_CLASS = 'bttv-chat-line-deleted';

function isVisible(node) {
  return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length);
}

function findAllUserMessages(name, targetMessageId) {
  return Array.from(document.querySelectorAll(CHAT_LINE_SELECTOR)).filter((node) => {
    const message = twitch.getChatMessageObject(node);
    if (!message) {
      return false;
    }
    if (!isVisible(node)) {
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
    domObserver.on('.chat-line__message--deleted-notice', (node, isConnected) => {
      if (!isConnected) return;

      const messageRenderer = twitch.getChatMessageRenderer(node);
      if (messageRenderer == null) {
        return;
      }

      const {message} = messageRenderer.props;
      if (this.handleDelete(message.user.userLogin, message.id)) {
        messageRenderer.props.isDeleted = false;
        messageRenderer.forceUpdate();
      }
    });
  }

  handleMessage({message, preventDefault}) {
    switch (message.type) {
      case twitch.getTMIActionTypes()?.CLEAR_CHAT:
        twitch.sendChatAdminMessage(
          formatMessage({defaultMessage: 'Chat was cleared by a moderator (Prevented by BetterTTV)'})
        );
        preventDefault();
        break;
      case twitch.getTMIActionTypes()?.MODERATION: {
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
    if (
      ![DeletedMessageTypes.HIDE, DeletedMessageTypes.SHOW, DeletedMessageTypes.HIGHLIGHT].includes(deletedMessages)
    ) {
      return false;
    }
    const messages = findAllUserMessages(name, targetMessageId);
    messages.forEach((message) => {
      // eslint-disable-next-line default-case
      switch (deletedMessages) {
        case DeletedMessageTypes.HIDE:
          message.style.display = 'none';
          break;
        case DeletedMessageTypes.HIGHLIGHT:
        case DeletedMessageTypes.SHOW:
          if (deletedMessages === DeletedMessageTypes.HIGHLIGHT) {
            ChatHighlightBlacklistKeywords.markHighlighted(message);
          }
          message.classList.toggle(CHAT_LINE_DELETED_CLASS, true);
          /* eslint-disable-next-line func-names */
          message.querySelectorAll(CHAT_LINE_LINK_SELECTOR).forEach((node) => {
            node.removeAttribute('href');
          });
          message.querySelector(CHAT_LINE_CLIP_CARD_SELECTOR)?.remove();
          break;
      }
    });
    return true;
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatDeletedMessagesModule()]);
