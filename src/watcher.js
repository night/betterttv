import debug from './utils/debug.js';
import SafeEventEmitter from './utils/safe-event-emitter.js';

import channelWatcher from './watchers/channel.js';
import clipsWatcher from './watchers/clips.js';
import chatWatcher from './watchers/chat.js';
import conversationWatcher from './watchers/conversations.js';
import routesWatcher from './watchers/routes.js';


const CLIPS_HOSTNAME = 'clips.twitch.tv';

class Watcher extends SafeEventEmitter {
    setup() {
        channelWatcher(this);

        if (window.location.hostname === CLIPS_HOSTNAME) {
            clipsWatcher(this);
        } else {
            chatWatcher(this);
            conversationWatcher(this);
            routesWatcher(this);
        }

        debug.log('Watcher started');
    }
}

export default new Watcher();
