const debug = require('./utils/debug');
const SafeEventEmitter = require('./utils/safe-event-emitter');

const CLIPS_HOSTNAME = 'clips.twitch.tv';

class Watcher extends SafeEventEmitter {
    setup() {
        require('./watchers/channel')(this);

        if (window.location.hostname === CLIPS_HOSTNAME) {
            require('./watchers/clips')(this);
        } else {
            require('./watchers/chat')(this);
            require('./watchers/reward')(this);
            require('./watchers/conversations')(this);
            require('./watchers/routes')(this);
        }

        debug.log('Watcher started');
    }
}

module.exports = new Watcher();
