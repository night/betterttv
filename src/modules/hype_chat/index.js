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

let removeTextAreaListener = null;
let removeHypeChatListener = null;

function toggleHypeChat() {
  const settingEnabled = settings.get(SettingIds.HYPE_CHAT);
  const streamChat = document.querySelector(STREAM_CHAT_SELECTOR);
  if (streamChat != null) {
    streamChat.classList.toggle(styles.hideHypeChatMessages, !settingEnabled);
  }
  const chatTextArea = document.querySelector(CHAT_TEXT_AREA_SELECTOR);
  if (chatTextArea != null) {
    chatTextArea.classList.toggle(styles.hideHypeChatButton, !settingEnabled);
  }
}

class HypeChatModule {
  constructor() {
    this.load();
    settings.on(`changed.${SettingIds.HYPE_CHAT}`, () => this.load());
  }

  load() {
    const settingEnabled = settings.get(SettingIds.HYPE_CHAT);

    if (!settingEnabled) {
      if (removeTextAreaListener == null) {
        removeTextAreaListener = dom.on(CHAT_TEXT_AREA_SELECTOR, (_, isConnected) => {
          if (!isConnected) {
            return;
          }
          toggleHypeChat();
        });
      }

      if (removeHypeChatListener != null) {
        removeHypeChatListener();
        removeHypeChatListener = null;
      }

      return;
    }

    toggleHypeChat();

    if (removeTextAreaListener != null) {
      removeTextAreaListener();
      removeTextAreaListener = null;
    }

    if (removeHypeChatListener == null) {
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
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HypeChatModule()]);
