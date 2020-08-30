const debug = require('./utils/debug');
const SafeEventEmitter = require('./utils/safe-event-emitter');

const CLIPS_HOSTNAME = 'clips.twitch.tv';

class Watcher extends SafeEventEmitter {
    constructor() {
        super();

        if (window.location.hostname === CLIPS_HOSTNAME) {
            this.setupClips();
            return;
        }

        this.setup();
    }

    setupClips() {
        require('./watchers/channel')(this);
        require('./watchers/clips')(this);

        debug.log('Watcher started');
    }

    setup() {
        require('./watchers/channel')(this);
        require('./watchers/chat')(this);
        require('./watchers/conversations')(this);
        require('./watchers/routes')(this);

        debug.log('Watcher started');
    }
}

module.exports = new Watcher();
