import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';

class HideChatEventsModule {
  constructor() {
    watcher.on('chat.message.handler', (message) => {
      this.handleMessage(message);
    });
  }

  handleMessage({message, preventDefault}) {
    switch (message.type) {
      case twitch.TMIActionTypes.RITUAL:
        if (settings.get('hideChatElements').includes(3)) {
          preventDefault();
        }
        break;
      case twitch.TMIActionTypes.SUBSCRIPTION:
      case twitch.TMIActionTypes.RESUBSCRIPTION:
      case twitch.TMIActionTypes.SUBGIFT:
        if (settings.get('hideChatElements').includes(4)) {
          preventDefault();
        }
        break;
      default:
        break;
    }
  }
}

export default new HideChatEventsModule();
