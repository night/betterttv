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
    this.commands.forEach((command) => {
      twitchCommandStore.addCommand(command);
    });
  }

  registerCommand(command) {
    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null) {
      return;
    }
    this.commands.push(command);
    twitchCommandStore.addCommand(command);
  }
}

export default new CommandStore();
