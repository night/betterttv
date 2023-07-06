import {PlatformTypes, SettingIds} from '../../constants.js';
import dom from '../../observers/dom.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import chat from '../chat/index.js';
import styles from './styles.module.css';

const HYPE_CHAT_WRAPPER_SELECTOR = '.paid-pinned-chat-message-content-wrapper';
const HYPE_CHAT_MESSAGE_SELECTOR = 'span[data-a-target="chat-message-text"]';

const CHAT_TEXT_AREA_SELECTOR = '.chat-input__textarea';
const STREAM_CHAT_SELECTOR = '.stream-chat';

let removeHypeChatListener = null;
class HypeChatModule {
  constructor() {
    this.load();
    settings.on(`changed.${SettingIds.HYPE_CHAT}`, () => this.load());
    dom.on(CHAT_TEXT_AREA_SELECTOR, (_, isConnected) => {
      if (!isConnected) {
        return;
      }
      this.loadHideHypeChat();
    });
  }

  load() {
    const settingEnabled = settings.get(SettingIds.HYPE_CHAT);
    this.loadHideHypeChat(settingEnabled);
    this.loadHypeChatMessageReplacer(settingEnabled);
  }

  loadHypeChatMessageReplacer(_settingEnabled = null) {
    const settingEnabled = _settingEnabled ?? settings.get(SettingIds.HYPE_CHAT);
    if (!settingEnabled && removeHypeChatListener != null) {
      removeHypeChatListener();
      removeHypeChatListener = null;
      return;
    }
    removeHypeChatListener = dom.on(HYPE_CHAT_WRAPPER_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }
      const messageNode = node.querySelector(HYPE_CHAT_MESSAGE_SELECTOR);
      if (messageNode == null) {
        return;
      }
      const user = twitch.getUserFromPinnedChat(node);
      chat.messageReplacer(messageNode, user);
    });
  }

  loadHideHypeChat(_settingEnabled = null) {
    const settingEnabled = _settingEnabled ?? settings.get(SettingIds.HYPE_CHAT);
    const streamChat = document.querySelector(STREAM_CHAT_SELECTOR);
    if (streamChat != null) {
      streamChat.classList.toggle(styles.hideHypeChatMessages, !settingEnabled);
    }
    const chatTextArea = document.querySelector(CHAT_TEXT_AREA_SELECTOR);
    if (chatTextArea != null) {
      chatTextArea.classList.toggle(styles.hideHypeChatButton, !settingEnabled);
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HypeChatModule()]);
