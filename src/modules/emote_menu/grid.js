import watcher from '../../watcher.js';
import emotes from '../emotes/index.js';

const COLOUMN_COUNT = 7;

export default class EmotesGrid {
  constructor() {
    this.headers = [];
    this.rows = [];
    this.totalCols = COLOUMN_COUNT;
    this.totalRows = Math.ceil(emotes.length / this.totalCols);
    this.loadEmotes();
  }

  loadEmotes() {
    let index = 0;

    this.headers = [];
    this.rows = [];

    for (const provider of emotes.getAllEmotes()) {
      if (provider.emotes.size === 0) {
        continue;
      }

      this.rows.push(provider.provider);
      this.headers.push(index);
      index++;

      const emotesIter = provider.emotes[Symbol.iterator]();

      for (let i = 0; i < this.totalRows; i++) {
        const row = [];
        for (let k = 0; k < this.totalCols; k++) {
          row.push(emotesIter.next().value);
        }
        this.rows.push(row);
        index++;
      }
    }
  }

  getRow(index) {
    return this.rows[index];
  }

  isHeader(index) {
    return this.headers.includes(index);
  }
}
