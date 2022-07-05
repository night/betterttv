import settings from '../../settings.js';
import watcher from '../../watcher.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {getCurrentChannel} from '../../utils/channel.js';
import {getCurrentUser} from '../../utils/user.js';

const CHAT_LINE_DELETED_CLASS = 'bttv-chat-line-deleted';

class ShadowBanDetector {
  constructor() {
    this.isLoaded = false;
    watcher.on('load.chat', () => this.load());
    watcher.on('chat.message', ($message, message) => this.handleMessage($message, message));
    settings.on(`changed.${SettingIds.SHADOW_BAN_DETECTOR}`, () =>
      settings.get(SettingIds.SHADOW_BAN_DETECTOR) ? this.load() : this.unload()
    );
  }

  handleMessage($message, message) {
    if (!this.isLoaded) {
      return;
    }

    if (!message.isHistorical && message.user.userID === getCurrentUser().id) {
      this.messagesToCheck.push([$message, message.messageBody.trim()]);
      $message.toggleClass(CHAT_LINE_DELETED_CLASS, true);
    }
  }

  updateChannel(channel) {
    this.currChannelId = channel.id;
    this.messagesToCheck.length = 0;
    this.socket.send(`join #${channel.name}`);
  }

  connect() {
    if (!this.isLoaded) {
      return;
    }

    this.socket = new WebSocket('wss://irc-ws.chat.twitch.tv/');
    this.socket.onclose = () => (this.isLoaded ? setTimeout(() => this.connect(), 1000) : null);
    this.socket.onerror = () => this.socket.close();

    this.socket.onmessage = ({type, data}) => {
      if (type !== 'message') {
        return;
      }

      // Extract actual message
      const sub = data.substring(data.indexOf('tmi.twitch.tv'));
      const msg = sub.substring(sub.indexOf(':') + 1).trim();

      const id = data
        .split(';')
        .find((elem) => elem.startsWith('user-id='))
        ?.split('=')[1];

      if (getCurrentUser().id === id) {
        for (let i = this.messagesToCheck.length - 1; i >= 0; i--) {
          const [$message, message] = this.messagesToCheck[i];
          if (msg === message) {
            this.messagesToCheck.splice(i, 1);
            $message.toggleClass(CHAT_LINE_DELETED_CLASS, false);
            return;
          }
        }
      }
    };

    this.socket.onopen = () => {
      this.socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
      this.socket.send('PASS SCHMOOPIIE');
      this.socket.send('NICK justinfan12345');
      this.socket.send('USER justinfan12345 8 * :justinfan12345');
      this.updateChannel(getCurrentChannel());
    };
  }

  load() {
    if (!settings.get(SettingIds.SHADOW_BAN_DETECTOR)) {
      return;
    }

    const channel = getCurrentChannel();
    if (channel === undefined) {
      return;
    }

    if (!this.isLoaded) {
      this.isLoaded = true;
      this.messagesToCheck = [];
      this.connect();
    } else if (this.currChannelId !== channel.id) {
      try {
        this.updateChannel(channel);
      } catch {} // Socket might've been in the process of restarting, will update in that case anyways.
    }
  }

  unload() {
    if (this.isLoaded) {
      this.isLoaded = false;
      delete this.messagesToCheck;
      this.socket?.close();
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new ShadowBanDetector()]);