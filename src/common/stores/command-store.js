import Fuse from 'fuse.js';
import nightbot from '../../utils/nightbot.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {getCurrentChannel} from '../../utils/channel.js';
import {getPlatform} from '../../utils/window.js';
import {PlatformTypes} from '../../constants.js';

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
    this.load();
    watcher.on('channel.updated', () => this.loadChannel());
  }

  async load() {
    // const data = await nightbot.get(`commands/default`);
    // this.defaultCommands = data.commands;
    this.loadChannel();
  }

  async loadChannel() {
    let nightbotChannelId = null;
    const channel = getCurrentChannel();

    if (getPlatform() === PlatformTypes.TWITCH) {
      const data = await nightbot.get(`channels/t/${channel.id}`);
      nightbotChannelId = data.channel._id;
    } else {
      const data = await nightbot.get(`channels/y/@dclstn`);
      nightbotChannelId = data.channel._id;
    }

    if (nightbotChannelId == null) {
      return;
    }

    const {commands} = await nightbot.get('commands', {headers: {'Nightbot-Channel': nightbotChannelId}});
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
