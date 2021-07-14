import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {SettingIds} from '../../constants.js';

const forcedURL = window.location.search.includes('bttv_anon_chat=true');

class AnonChatModule {
  constructor() {
    this.enabled = false;
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.ANON_CHAT}`, () => this.load());
  }

  changeUser(username, message) {
    const client = twitch.getChatServiceClient();
    if (!client) return;

    const socket = client.connection.ws;
    if (!socket || client.configuration.username === username) return;

    client.configuration.username = username;
    twitch.sendChatAdminMessage(`BetterTTV: [Anon Chat] ${message}`);
    try {
      socket.send('QUIT');
    } catch (_) {
      // Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
    }
  }

  part() {
    this.changeUser('justinfan12345', 'Logging you out of chat...');
    this.enabled = true;
  }

  join() {
    const currentUser = twitch.getCurrentUser();
    if (!currentUser) return;

    this.changeUser(currentUser.name, 'Logging you into chat...');
    this.enabled = false;
  }

  load() {
    this.enabled = false;
    if (forcedURL || settings.get(SettingIds.ANON_CHAT)) {
      this.part();
    } else {
      this.join();
    }
  }

  onSendMessage(sendState) {
    if (this.enabled && !sendState.message.startsWith('/join')) {
      twitch.sendChatAdminMessage(
        "You can't send messages when Anon Chat is enabled. Type /join or disable Anon Chat in options."
      );
      sendState.preventDefault();
    }
  }
}

export default new AnonChatModule();
