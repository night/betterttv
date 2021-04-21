import SafeEventEmitter from '../utils/safe-event-emitter.js';

class HistoryObserver extends SafeEventEmitter {
  constructor() {
    super();

    const {history, location, replaceState} = window;
    const {pushState} = history;

    history.pushState = (...args) => {
      const state = args[0];
      pushState.apply(history, args);
      this.emit('pushState', location, state);
    };
    history.replaceState = (...args) => {
      const state = args[0];
      replaceState.apply(history, args);
      this.emit('replaceState', location, state);
    };
    window.addEventListener('popstate', ({state}) => this.emit('popState', location, state));
  }
}

export default new HistoryObserver();
