import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import {ChatFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

class HideChatEventsModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => {
      this.handleMessage(message);
    });
  }

  handleMessage({message, preventDefault}) {
    switch (message.type) {
      case twitch.TMIActionTypes.RITUAL:
        if (!hasFlag(settings.get(SettingIds.CHAT), ChatFlags.VIEWER_GREETING)) {
          preventDefault();
        }
        break;
      case twitch.TMIActionTypes.SUBSCRIPTION:
      case twitch.TMIActionTypes.RESUBSCRIPTION:
      case twitch.TMIActionTypes.SUBGIFT:
        if (!hasFlag(settings.get(SettingIds.CHAT), ChatFlags.SUB_NOTICE)) {
          preventDefault();
        }
        break;
      default:
        break;
    }
  }
}

export default new HideChatEventsModule();
