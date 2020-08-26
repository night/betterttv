const EventEmitter = require('events').EventEmitter;

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

        // Monkey-patch on/once to be "safer" & log errors
        const oldOn = this.on;
        const oldOnce = this.once;
        this.on = (type, listener) => {
            const callback = newListener.bind(this, listener);
            oldOn.call(this, type, callback);
            return () => this.off(type, callback);
        };
        this.once = (type, listener) => {
            const callback = newListener.bind(this, listener);
            oldOnce.call(this, type, callback);
            return () => this.off(type, callback);
        };
        this.setMaxListeners(100);
    }
}

module.exports = SafeEventEmitter;
