import formatMessage from '@/i18n/index';
import twitch from '@/utils/twitch';
import watcher from '@/watcher';

export const PermissionLevels = {
  VIEWER: 0,
  VIP: 1,
  MODERATOR: 2,
  BROADCASTER: 3,
};

const ADDED_BY_BTTV_SUFFIX = formatMessage({defaultMessage: '(Added by BetterTTV)'});

function buildInjectedDescription(description) {
  if (!description) {
    return ADDED_BY_BTTV_SUFFIX;
  }
  return `${description} ${ADDED_BY_BTTV_SUFFIX}`;
}

class CommandStore {
  constructor() {
    this.commands = [];
    watcher.on('load.chat', () => this.loadCommands());
  }

  loadCommands() {
    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null || this.commands.length === 0) {
      return;
    }
    for (const command of this.commands) {
      twitchCommandStore.addCommand(command);
    }
  }

  registerCommand(command) {
    const injectedCommand = {...command, description: buildInjectedDescription(command.description)};
    this.commands.push(injectedCommand);

    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null) {
      return;
    }
    twitchCommandStore.addCommand(injectedCommand);
  }
}

export default new CommandStore();
