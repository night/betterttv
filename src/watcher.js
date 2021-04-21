import debug from './utils/debug.js';
import SafeEventEmitter from './utils/safe-event-emitter.js';

const CLIPS_HOSTNAME = 'clips.twitch.tv';

class Watcher extends SafeEventEmitter {
  async setup() {
    (await import('./watchers/channel.js')).default(this);

    if (window.location.hostname === CLIPS_HOSTNAME) {
      (await import('./watchers/clips.js')).default(this);
    } else {
      (await import('./watchers/chat.js')).default(this);
      (await import('./watchers/conversations.js')).default(this);
      (await import('./watchers/routes.js')).default(this);
    }

    debug.log('Watcher started');
  }
}

export default new Watcher();
