import SafeEventEmitter from '../../utils/safe-event-emitter.js';
import watcher from '../../watcher.js';
import emotes from '../emotes/index.js';

const COLOUMN_COUNT = 7;

class EmotesGrid extends SafeEventEmitter {
  constructor() {
    super();

    this.focus = null;
    this.headers = [];
    this.rows = [];
    this.providers = [];

    this.totalCols = COLOUMN_COUNT;

    watcher.on('channel.updated', () => {
      this.loadEmotes();
    });
  }

  get totalRows() {
    return this.rows.length;
  }

  loadEmotes() {
    this.headers = {};
    this.rows = [];

    for (const provider of emotes.getAllEmotes()) {
      if (provider.emotes.size === 0) {
        continue;
      }

      this.headers[this.totalRows] = provider.provider;
      this.rows.push(provider.provider);

      const emotesIter = provider.emotes[Symbol.iterator]();
      const totalRows = Math.ceil(provider.emotes.size / COLOUMN_COUNT);

      for (let i = 0; i < totalRows; i++) {
        const row = [];
        for (let k = 0; k < this.totalCols; k++) {
          row.push(emotesIter.next().value);
        }
        this.rows.push(row);
      }
    }

    this.emit('loaded');
  }

  getRow(index) {
    return this.rows[index];
  }

  getHeaders() {
    return Object.values(this.headers);
  }

  setFocus(rowIndex, scrollTo = false) {
    this.focus = rowIndex;
    this.emit('focus.change', scrollTo);
  }

  isHeader(index) {
    return index in this.headers;
  }
}

export default new EmotesGrid();
