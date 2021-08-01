import Fuse from 'fuse.js';
import watcher from '../../watcher.js';
import emotes from '../emotes/index.js';

class EmoteSearch {
  constructor() {
    this.options = {
      keys: ['code'],
    };
    this.search = new Fuse(emotes.getEmotes(), this.options);

    watcher.on('channel.updated', () => {
      this.search = new Fuse(emotes.getEmotes(), this.options);
    });
  }
}

export default new EmoteSearch();
