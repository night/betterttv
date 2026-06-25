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
    let injectedCommand = this.injectedCommands.get(command);
    if (injectedCommand == null) {
      injectedCommand = {
        ...command,
        description: command.description ? `${command.description} ${ADDED_BY_BTTV_SUFFIX}` : ADDED_BY_BTTV_SUFFIX,
      };
      this.injectedCommands.set(command, injectedCommand);
    }
    return injectedCommand;
  }

  syncCommands() {
    const twitchCommandStore = twitch.getChatCommandStore();
    if (twitchCommandStore == null || this.commands.length === 0) {
      return;
    }

    const {enabled} = this;
    for (const command of this.commands) {
      const injectedCommand = this.getInjectedCommand(command);
      // always remove first so re-syncs (toggle / chat reload) never duplicate
      twitchCommandStore.removeCommand?.(injectedCommand);
      if (enabled) {
        twitchCommandStore.addCommand(injectedCommand);
      }
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
