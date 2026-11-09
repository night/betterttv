import twitch from '@/utils/twitch';
import watcher from '@/watcher';

export const PermissionLevels = {
  VIEWER: 0,
  VIP: 1,
  MODERATOR: 2,
  BROADCASTER: 3,
};

const PATCHED_SENTINEL = Symbol('patched symbol');

let twitchDetermineGroup = null;

function determineGroup(command) {
  if (command.__bttvInjectedCommand === true) {
    return 'betterttv';
  }
  return twitchDetermineGroup.call(this, command);
}

function patchCommandGroups() {
  const commandProvider = twitch
    .getAutocompleteStateNode()
    ?.stateNode.providers.find(({autocompleteType}) => autocompleteType === 'command');
  if (commandProvider?.determineGroup == null || commandProvider.__bttvCommandGroupsPatched === PATCHED_SENTINEL) {
    return;
  }

  commandProvider.__bttvCommandGroupsPatched = PATCHED_SENTINEL;
  twitchDetermineGroup = commandProvider.determineGroup;
  commandProvider.determineGroup = determineGroup;
}

class CommandStore {
  constructor() {
    this.commands = [];
    watcher.on('load.chat', () => this.loadCommands());
  }

  loadCommands() {
    patchCommandGroups();

    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null || this.commands.length === 0) {
      return;
    }
    for (const command of this.commands) {
      twitchCommandStore.addCommand(command);
    }
  }

  registerCommand(command) {
    const injectedCommand = {...command, __bttvInjectedCommand: true};
    this.commands.push(injectedCommand);

    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null) {
      return;
    }
    patchCommandGroups();
    twitchCommandStore.addCommand(injectedCommand);
  }
}

export default new CommandStore();
