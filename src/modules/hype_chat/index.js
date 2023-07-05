import {PlatformTypes, SettingIds} from '../../constants.js';
import dom from '../../observers/dom.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import chat from '../chat/index.js';
import styles from './styles.module.css';

const HYPE_CHAT_WRAPPER_SELECTOR = '.paid-pinned-chat-message-content-wrapper';
const HYPE_CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';

let removeHypeChatListener = null;
class HypeChatModule {
  constructor() {
    this.loadHideHypeChat();
    this.loadHypeChatMessageReplacer();
    settings.on(`changed.${SettingIds.HYPE_CHAT}`, () => {
      this.loadHideHypeChat();
      this.loadHypeChatMessageReplacer();
    });
  }

  loadHypeChatMessageReplacer() {
    const settingEnabled = settings.get(SettingIds.HYPE_CHAT);
    if (!settingEnabled && removeHypeChatListener != null) {
      removeHypeChatListener();
      removeHypeChatListener = null;
      return;
    }
    removeHypeChatListener = dom.on(HYPE_CHAT_WRAPPER_SELECTOR, (node, isConnected) => {
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

  loadHideHypeChat() {
    const settingEnabled = settings.get(SettingIds.HYPE_CHAT);
    document.body.classList.toggle(styles.hideHypeChatMessages, !settingEnabled);
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HypeChatModule()]);
