import {EventEmitter} from 'events';
import debug from './debug.js';

function newListener(listener, ...args) {
  try {
    listener(...args);
  } catch (e) {
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
    super.on(type, callback);
    return () => super.off(type, callback);
  }

  once(type, listener) {
    const callback = newListener.bind(this, listener);
    super.once(type, callback);
    return () => super.off(type, callback);
  }

  off() {
    throw new Error('.off cannot be called directly. you must use the returned cleanup function from .on/.once');
  }
}

export default SafeEventEmitter;
