import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

export const PermissionLevels = {
  VIEWER: 0,
  VIP: 1,
  MODERATOR: 2,
  BROADCASTER: 3,
};

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
    this.commands.push(command);
    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null) {
      return;
    }
    twitchCommandStore.addCommand(command);
  }
}

export default new CommandStore();
