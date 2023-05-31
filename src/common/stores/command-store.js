import Fuse from 'fuse.js';
import nightbot from '../../utils/nightbot.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {getCurrentChannel} from '../../utils/channel.js';

const UserLevels = {
  EVERYONE: 'everyone',
  SUBSCRIBER: 'subscriber',
  REGULAR: 'regular',
  TWITCH_VIP: 'twitch_vip',
  MODERATOR: 'moderator',
  OWNER: 'owner',
};

const UserLevelHierarchy = {
  [UserLevels.EVERYONE]: 0,
  [UserLevels.SUBSCRIBER]: 1,
  [UserLevels.REGULAR]: 2,
  [UserLevels.TWITCH_VIP]: 3,
  [UserLevels.MODERATOR]: 4,
  [UserLevels.OWNER]: 5,
};

function getCurrentUserLevel() {
  const currentChat = twitch.getCurrentChat();
  if (currentChat == null) {
    return UserLevels.EVERYONE;
  }
  const {isOwnChannel, isCurrentUserVIP, isCurrentUserMod} = currentChat;
  if (isOwnChannel) {
    return UserLevels.OWNER;
  }
  if (isCurrentUserMod) {
    return UserLevels.MODERATOR;
  }
  if (isCurrentUserVIP) {
    return UserLevels.TWITCH_VIP;
  }
  return UserLevels.EVERYONE;
}

class CommandStore {
  constructor() {
    this.defaultCommands = [];
    this.commands = new Fuse([], {keys: ['name', 'description']});
    watcher.on('load.chat', () => this.loadChannel());
  }

  async load() {
    // const data = await nightbot.get(`commands/default`);
    // this.defaultCommands = data.commands;
    this.loadChannel();
  }

  async loadChannel() {
    const channel = getCurrentChannel();
    console.log(channel);

    const data = await nightbot.get(`channels/t/vasp`);
    const {commands} = await nightbot.get('commands', {headers: {'Nightbot-Channel': data.channel._id}});
    const userLevel = getCurrentUserLevel();

    const filteredCommands = commands.filter((command) => {
      if (!command.name.startsWith('!')) {
        return false;
      }
      const commandUserLevel = UserLevelHierarchy[command.userLevel.toLowerCase()];
      if (commandUserLevel > UserLevelHierarchy[userLevel]) {
        return false;
      }
      return true;
    });

    this.commands.setCollection(filteredCommands);
  }

  search(query) {
    return this.commands.search(query);
  }
}

export default new CommandStore();
