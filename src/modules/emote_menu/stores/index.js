import Fuse from 'fuse.js';
import SafeEventEmitter from '../../../utils/safe-event-emitter.js';
import watcher from '../../../watcher.js';
import emojiCategories from './emoji-categories.js';
import channelEmotes from '../../emotes/channel-emotes.js';
import globalEmotes from '../../emotes/global-emotes.js';
import ffzChannelEmotes from '../../frankerfacez/channel-emotes.js';
import ffzGlobalEmotes from '../../frankerfacez/global-emotes.js';
import Icons from '../components/Icons.jsx';

const COLOUMN_COUNT = 7;

function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

const fuse = new Fuse([], {
  keys: ['code'],
  threshold: 0.25,
});

class EmoteStore extends SafeEventEmitter {
  constructor() {
    super();
    watcher.on('channel.updated', () => {
      this.loadProviders();
      this.loadEmotes();
    });
  }

  loadProviders() {
    this.providers = [
      {
        provider: {
          id: 'bttv',
          displayName: 'BetterTTV',
          icon: Icons.THUMBS_UP,
        },
        emotes: [...channelEmotes.getEmotes(), ...globalEmotes.getEmotes()],
      },
      {
        provider: {
          id: 'ffz',
          displayName: 'FrankerFaceZ',
          icon: Icons.DOG,
        },
        emotes: [...ffzChannelEmotes.getEmotes(), ...ffzGlobalEmotes.getEmotes()],
      },
      ...emojiCategories,
    ];
  }

  search(search) {
    return fuse.search(search);
  }

  loadEmotes() {
    this.rows = [];
    this.headers = [];
    this.emotes = [];

    for (const {provider, emotes} of this.providers) {
      if (emotes.length === 0) continue;

      this.headers.push(this.rows.length);
      this.emotes = this.emotes.concat(emotes);
      this.rows = this.rows.concat([provider, ...chunkArray(emotes, COLOUMN_COUNT)]);
    }

    fuse.setCollection(this.getEmotes());

    this.emit('loaded');
  }

  get totalRows() {
    return this.rows.length;
  }

  getEmotes() {
    return this.emotes;
  }

  getRow(index) {
    return this.rows[index];
  }

  getHeaders() {
    return this.headers;
  }

  getHeader(index) {
    return this.getRow(this.getHeaders()[index]);
  }

  getHeaderIndexById(id) {
    return this.getHeaders().find((header) => this.getRow(header)?.id === id);
  }

  isHeader(index) {
    return this.getHeaders().includes(index);
  }
}

export default new EmoteStore();
