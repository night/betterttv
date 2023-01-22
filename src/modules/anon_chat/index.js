import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {PlatformTypes, SettingIds} from '../../constants.js';
import {getCurrentUser} from '../../utils/user.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import formatMessage from '../../i18n/index.js';

const forcedURL = window.location.search.includes('bttv_anon_chat=true');

class AnonChatModule {
  constructor() {
    this.enabled = false;
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.ANON_CHAT}`, () => this.load());
  }

  changeUser(username, logout) {
    const client = twitch.getChatServiceClient();
    if (!client) return;

    const socket = client.connection.ws;
    if (!socket || client.configuration.username === username) return;

    client.configuration.username = username;
    twitch.sendChatAdminMessage(
      logout
        ? formatMessage({defaultMessage: 'BetterTTV: [Anon Chat] Logging you out of chat...'})
        : formatMessage({defaultMessage: 'BetterTTV: [Anon Chat] Logging you into chat...'})
    );
    try {
      socket.send('QUIT');
    } catch (_) {
      // Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
    }
  }

  part() {
    this.changeUser('justinfan12345', true);
    this.enabled = true;
  }

  join() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    this.changeUser(currentUser.name, false);
    this.enabled = false;
  }

  load() {
    this.enabled = false;
    const whitelistedChannels = settings.get(SettingIds.ANON_CHAT_WHITELISTED_CHANNELS);
    const currentChannelName = twitch.getCurrentChat()?.props?.channelLogin;
    if (
      forcedURL ||
      (settings.get(SettingIds.ANON_CHAT) &&
        !whitelistedChannels.map((user) => user.toLowerCase()).includes(currentChannelName))
    ) {
      this.part();
    } else {
      this.join();
    }
  }

  onSendMessage(sendState) {
    if (this.enabled && !sendState.message.startsWith('/join')) {
      twitch.sendChatAdminMessage(
        formatMessage({
          defaultMessage:
            "You can't send messages when Anon Chat is enabled. Type /join or disable Anon Chat in options.",
        })
      );
      sendState.preventDefault();
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new AnonChatModule()]);
