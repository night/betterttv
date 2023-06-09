import {PlatformTypes, SettingIds} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import settings from '../../settings.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import {getCurrentUser} from '../../utils/user.js';
import watcher from '../../watcher.js';

const forcedURL = window.location.search.includes('bttv_anon_chat=true');

class AnonChatModule {
  constructor() {
    this.enabled = false;
    watcher.on('load.chat', () => this.load());
    settings.on(`changed.${SettingIds.ANON_CHAT}`, () => this.load());
    settings.on(`changed.${SettingIds.ANON_CHAT_WHITELISTED_CHANNELS}`, () => this.load());
    settings.on(`changed.${SettingIds.ANON_CHAT_BLACKLISTED_CHANNELS}`, () => this.load());
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
    const settingEnabled = settings.get(SettingIds.ANON_CHAT);
    const channels = settingEnabled
      ? settings.get(SettingIds.ANON_CHAT_WHITELISTED_CHANNELS)
      : settings.get(SettingIds.ANON_CHAT_BLACKLISTED_CHANNELS);
    const currentChannelName = twitch.getCurrentChat()?.props?.channelLogin;

    let shouldPart = channels.map((user) => user.toLowerCase()).includes(currentChannelName);
    if (settingEnabled) {
      shouldPart = !shouldPart;
    }

    if (forcedURL || shouldPart) {
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
