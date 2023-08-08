import {ChatFullscreenPopupTypes, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';

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
    if (settings.get(SettingIds.CHAT_FULLSCREEN_POPUP) === ChatFullscreenPopupTypes.DISABLED) {
      this.disableKeyListeners();
      this.hideChatPopup();
    }
  }

  updateElements() {
    this.chatElement = document.querySelector('.stream-chat');
    this.originalChatParentElement = this.chatElement.parentNode;
  }

  fullscreenChanged() {
    if (
      document.fullscreenElement &&
      settings.get(SettingIds.CHAT_FULLSCREEN_POPUP) !== ChatFullscreenPopupTypes.DISABLED
    ) {
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
    window.removeEventListener('keydown', this.fullscreenKeydownListener);
    window.removeEventListener('keyup', this.fullscreenKeyupListener);
    this.keyupPressed = true;
  }

  fullscreenKeydown(event) {
    if (event.key === 'c' && this.keyupPressed) {
      this.toggleFullscreenChatPopup();
      this.keyupPressed = false;
    }
  }

  fullscreenKeyup(event) {
    if (event.key === 'c') {
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
    if (this.chatElement.parentNode === this.originalChatParentElement) {
      document.fullscreenElement.appendChild(this.chatElement);
    }
    this.chatElement.classList.add('bttv-fullscreen-chat');
    this.fullscreenChatPopupShown = true;
    twitch.getChatScroller().resume();
  }

  hideChatPopup() {
    this.chatElement.classList.remove('bttv-fullscreen-chat');
    if (this.chatElement.parentNode !== this.originalChatParentElement) {
      this.originalChatParentElement.appendChild(this.chatElement);
    }
    this.fullscreenChatPopupShown = false;
    twitch.getChatScroller().resume();
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ChatFullscreenPopup()]);
