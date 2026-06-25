import {SettingIds} from '@/constants';
import formatMessage from '@/i18n/index';
import settings from '@/settings';
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
    // original command -> decorated command injected into Twitch (stable reference for add/remove)
    this.injectedCommands = new Map();
    watcher.on('load.chat', () => this.syncCommands());
    settings.on(`changed.${SettingIds.TWITCH_SLASH_COMMANDS}`, () => this.syncCommands());
  }

  get enabled() {
    return settings.get(SettingIds.TWITCH_SLASH_COMMANDS);
  }

  getCommands() {
    return this.commands;
  }

  getVisibleCommands() {
    return this.commands.filter((command) => !command.hidden);
  }

  getInjectedCommand(command) {
    const cached = this.injectedCommands.get(command);
    if (cached != null) {
      return cached;
    }

    const injectedCommand = {...command, description: buildInjectedDescription(command.description)};
    this.injectedCommands.set(command, injectedCommand);
    return injectedCommand;
  }

  syncCommand(twitchCommandStore, command, enabled) {
    const injectedCommand = this.getInjectedCommand(command);
    // always remove first so re-syncs (toggle / chat reload) never duplicate
    twitchCommandStore.removeCommand?.(injectedCommand);
    if (enabled) {
      twitchCommandStore.addCommand(injectedCommand);
    }
  }

  syncCommands() {
    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null || this.commands.length === 0) {
      return;
    }

    const {enabled} = this;
    for (const command of this.commands) {
      this.syncCommand(twitchCommandStore, command, enabled);
    }
  }

  registerCommand(command) {
    this.commands.push(command);

    if (!this.enabled) {
      return;
    }

    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null) {
      return;
    }
    twitchCommandStore.addCommand(this.getInjectedCommand(command));
  }
}

export default new CommandStore();
