import twitch from '@/utils/twitch';
import watcher from '@/watcher';

export const PermissionLevels = {
  VIEWER: 0,
  VIP: 1,
  MODERATOR: 2,
  BROADCASTER: 3,
};

const BTTV_COMMAND_GROUP = 'betterttv';
const TWITCH_COMMAND_GROUP = 'twitch';

let twitchDetermineGroup = null;

function determineGroup(command) {
  if (command.group != null) {
    return command.group;
  }
  return twitchDetermineGroup.call(this, command) ?? TWITCH_COMMAND_GROUP;
}

function getAutocompleteCommandProvider() {
  const autocompleteNode = twitch.getAutocompleteStateNode();
  if (autocompleteNode == null) {
    return null;
  }

  const autocompleteProviders = autocompleteNode.stateNode.providers;
  return autocompleteProviders.find(({autocompleteType}) => autocompleteType === 'command');
}

function patchCommandGroups() {
  const commandProvider = getAutocompleteCommandProvider();
  if (commandProvider?.determineGroup == null || commandProvider.determineGroup === determineGroup) {
    return;
  }

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
    const injectedCommand = {...command, group: BTTV_COMMAND_GROUP};
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
