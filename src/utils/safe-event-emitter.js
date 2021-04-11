import {EventEmitter} from 'events'

function newListener(listener, ...args) {
    try {
        listener(...args);
    } catch (e) {
        const debug = require('./debug');
        debug.error('Failed executing listener callback', e.stack);
    }
}

class SafeEventEmitter extends EventEmitter {
    constructor() {
        super();

        this.setMaxListeners(100);
    }

    on(type, listener) {
        const callback = newListener.bind(this, listener);
        super.on(type, listener);
        return () => this.off(type, callback);
    }

    once(type, listener) {
        const callback = newListener.bind(this, listener);
        super.once(type, listener);
        return () => this.off(type, callback);
    }
}

export default SafeEventEmitter;
