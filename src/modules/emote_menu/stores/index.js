import Fuse from 'fuse.js';
import SafeEventEmitter from '../../../utils/safe-event-emitter.js';
import watcher from '../../../watcher.js';
import emojiCategories from './emoji-categories.js';
import channelEmotes from '../../emotes/channel-emotes.js';
import globalEmotes from '../../emotes/global-emotes.js';
import ffzChannelEmotes from '../../frankerfacez/channel-emotes.js';
import ffzGlobalEmotes from '../../frankerfacez/global-emotes.js';
import Icons from '../components/Icons.jsx';
import recentEmotes from './recent-emotes.js';

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

    this.emotes = new Map();

    watcher.on('channel.updated', () => {
      this.loadProviders();
      this.loadEmotes();
      this.createRows();
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
    this.emotes.clear();

    for (const {emotes} of this.providers) {
      for (const emote of emotes) {
        this.emotes.set(emote.id, emote);
      }
    }

    fuse.setCollection(this.getEmotes());

    this.loadRecentEmotes();
  }

  createRows() {
    this.rows = [];
    this.headers = [];

    for (const {provider, emotes} of this.providers) {
      if (emotes.length === 0) continue;

      this.headers.push(this.rows.length);
      this.rows = this.rows.concat([provider, ...chunkArray(emotes, COLOUMN_COUNT)]);
    }
  }

  loadRecentEmotes() {
    const emotes = recentEmotes
      .getEmoteIds()
      .map((id) => this.emotes.get(id))
      .filter((emote) => emote != null);

    this.providers.unshift({
      provider: {
        id: 'recents',
        displayName: 'Recently Used',
        icon: Icons.CLOCK,
      },
      emotes,
    });
  }

  get totalRows() {
    return this.rows.length;
  }

  getEmotes() {
    return [...this.emotes.values()];
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
