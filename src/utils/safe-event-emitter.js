const EventEmitter = require('events').EventEmitter;
const Raven = require('raven-js');

function newListener(listener, ...args) {
    try {
        Raven.context(() => listener(...args));
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
        this.on = (type, listener) => oldOn.call(this, type, newListener.bind(this, listener));
        this.once = (type, listener) => oldOnce.call(this, type, newListener.bind(this, listener));
        this.setMaxListeners(100);
    }
}

module.exports = SafeEventEmitter;
