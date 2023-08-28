import {PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import styles from './style.module.css';

const TRIGGER_KEY = 'c';

class ChatFullscreenPopup {
  constructor() {
    settings.on(`changed.${SettingIds.CHAT_FULLSCREEN_POPUP}`, () => this.togglePlugin());
    this.updateElements();
    this.fullscreenChatPopupShown = false;

    window.addEventListener('fullscreenchange', () => this.fullscreenChanged());

    this.fullscreenKeydownListener = this.fullscreenKeydown.bind(this);

    // Keep track of keyup as well to prevent flickering when holding 'c'
    this.keyupPressed = true;
    this.fullscreenKeyupListener = this.fullscreenKeyup.bind(this);
  }

  togglePlugin() {
    if (!settings.get(SettingIds.CHAT_FULLSCREEN_POPUP)) {
      this.disableKeyListeners();
      this.hideChatPopup();
    }
  }

  updateElements() {
    this.chatElement = document.querySelector('.stream-chat');
    this.originalChatParentElement = this.chatElement?.parentNode;
  }

  fullscreenChanged() {
    if (document.fullscreenElement != null && settings.get(SettingIds.CHAT_FULLSCREEN_POPUP)) {
      this.enableKeyListeners();
    } else {
      this.disableKeyListeners();
      this.hideChatPopup();
    }
  }

  enableKeyListeners() {
    this.keyupPressed = true;
    window.addEventListener('keydown', this.fullscreenKeydownListener);
    window.addEventListener('keyup', this.fullscreenKeyupListener);
  }

  disableKeyListeners() {
    this.keyupPressed = true;
    window.removeEventListener('keydown', this.fullscreenKeydownListener);
    window.removeEventListener('keyup', this.fullscreenKeyupListener);
  }

  fullscreenKeydown(event) {
    if (event.key === TRIGGER_KEY && this.keyupPressed) {
      this.toggleFullscreenChatPopup();
      this.keyupPressed = false;
    }
  }

  fullscreenKeyup(event) {
    if (event.key === TRIGGER_KEY) {
      this.keyupPressed = true;
    }
  }

  toggleFullscreenChatPopup() {
    if (!document.fullscreenElement) {
      this.hideChatPopup();
      return;
    }

    if (this.fullscreenChatPopupShown) {
      this.hideChatPopup();
    } else {
      this.showChatPopup();
    }
  }

  showChatPopup() {
    if (this.chatElement == null || this.originalChatParentElement == null) {
      return;
    }

    if (this.chatElement.parentNode === this.originalChatParentElement) {
      document.fullscreenElement.appendChild(this.chatElement);
    }
    this.chatElement.classList.add(styles.bttvFullscreenChat);
    this.fullscreenChatPopupShown = true;
    twitch.getChatScroller().resume();
  }

  hideChatPopup() {
    if (this.chatElement == null || this.originalChatParentElement == null) {
      return;
    }

    this.chatElement.classList.remove(styles.bttvFullscreenChat);
    if (this.chatElement.parentNode !== this.originalChatParentElement) {
      this.originalChatParentElement.appendChild(this.chatElement);
    }
    this.fullscreenChatPopupShown = false;
    twitch.getChatScroller().resume();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatFullscreenPopup()]);
