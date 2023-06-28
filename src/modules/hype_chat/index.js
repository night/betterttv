import {PlatformTypes} from '../../constants.js';
import dom from '../../observers/dom.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import chat from '../chat/index.js';

const HYPE_CHAT_WRAPPER_SELECTOR = '.paid-pinned-chat-message-content-wrapper';
const HYPE_CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';

class HypeChatModule {
  constructor() {
    dom.on(HYPE_CHAT_WRAPPER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }
      const user = twitch.getUserFromPinnedChat(node);
      const messageNode = node.querySelector(HYPE_CHAT_MESSAGE_SELECTOR);
      if (messageNode == null) {
        return;
      }
      chat.messageReplacer(messageNode, user);
    });
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HypeChatModule()]);
