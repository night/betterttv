import {ChatFlags, PlatformTypes, SettingIds} from '../../constants.js';
import settings from '../../settings.js';
import {hasFlag} from '../../utils/flags.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import twitch from '../../utils/twitch.js';
import watcher from '../../watcher.js';

class HideChatEventsModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => {
      this.handleMessage(message);
    });
  }

  handleMessage({message, preventDefault}) {
    switch (message.type) {
      case twitch.getTMIActionTypes()?.FIRST_MESSAGE_HIGHLIGHT:
        if (!hasFlag(settings.get(SettingIds.CHAT), ChatFlags.VIEWER_GREETING)) {
          preventDefault();
        }
        break;
      case twitch.getTMIActionTypes()?.SUBSCRIPTION:
      case twitch.getTMIActionTypes()?.RESUBSCRIPTION:
      case twitch.getTMIActionTypes()?.SUBGIFT:
        if (!hasFlag(settings.get(SettingIds.CHAT), ChatFlags.SUB_NOTICE)) {
          preventDefault();
        }
        break;
      default:
        break;
    }
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new HideChatEventsModule()]);
