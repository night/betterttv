import {PlatformTypes} from './constants.js';
import debug from './utils/debug.js';
import SafeEventEmitter from './utils/safe-event-emitter.js';
import {getPlatform} from './utils/window.js';

class Watcher extends SafeEventEmitter {
  async setup() {
    (await import('./watchers/channel.js')).default(this);

    const platform = getPlatform();

    if (platform === PlatformTypes.YOUTUBE) {
      (await import('./watchers/youtube.js')).default(this);
    } else if (platform === PlatformTypes.TWITCH_CLIPS) {
      (await import('./watchers/clips.js')).default(this);
    } else if (platform === PlatformTypes.TWITCH) {
      (await import('./watchers/chat.js')).default(this);
      (await import('./watchers/conversations.js')).default(this);
      (await import('./watchers/routes.js')).default(this);
    }

    debug.log('Watcher started');
  }
}

export default new Watcher();
