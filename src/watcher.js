import debug from './utils/debug';
import SafeEventEmitter from './utils/safe-event-emitter';

import channel_watcher from './watchers/channel';
import clips_watcher from './watchers/clips';
import chat_watcher from './watchers/chat';
import conversation_watcher from './watchers/conversations';
import routes_watcher from './watchers/routes';


const CLIPS_HOSTNAME = 'clips.twitch.tv';

class Watcher extends SafeEventEmitter {
    setup() {
        channel_watcher(this);

        if (window.location.hostname === CLIPS_HOSTNAME) {
            clips_watcher(this);
        } else {
            chat_watcher(this);
            conversation_watcher(this);
            routes_watcher(this);
        }

        debug.log('Watcher started');
    }
}

export default new Watcher();
