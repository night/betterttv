import Fuse from 'fuse.js';
import SafeEventEmitter from '../../../utils/safe-event-emitter.js';
import watcher from '../../../watcher.js';
import emojiCategories from './emoji-categories.js';
import channelEmotes from '../../emotes/channel-emotes.js';
import globalEmotes from '../../emotes/global-emotes.js';
import ffzChannelEmotes from '../../frankerfacez/channel-emotes.js';
import ffzGlobalEmotes from '../../frankerfacez/global-emotes.js';
import Icons from '../components/Icons.jsx';
import emoteStorage from './emote-storage.js';
import twitchEmotes from './twitch-emotes.js';

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
      this.loadConditionalEmotes();
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
      ...twitchEmotes.getSets(),
      ...emojiCategories,
    ];
  }

  search(search) {
    return fuse.search(search);
  }

  incrementEmote(emote) {
    emoteStorage.incrementEmote(emote);

    this.loadConditionalEmotes();
    this.createRows();
  }

  toggleFavorite(emote) {
    emoteStorage.toggleFavorite(emote);

    this.loadConditionalEmotes();
    this.createRows();
  }

  loadEmotes() {
    this.emotes.clear();

    for (const {emotes} of this.providers) {
      for (const emote of emotes) {
        this.emotes.set(String(emote.id), emote);
      }
    }

    fuse.setCollection(this.getEmotes());
  }

  createRows() {
    this.rows = [];
    this.headers = [];

    for (const {provider, emotes} of [...this.conditionalProviders, ...this.providers]) {
      if (emotes.length === 0) continue;

      this.headers.push(this.rows.length);
      this.rows = this.rows.concat([provider, ...chunkArray(emotes, COLOUMN_COUNT)]);
    }

    this.emit('updated');
  }

  loadConditionalEmotes() {
    const recents = emoteStorage
      .getRecents()
      .map((id) => this.emotes.get(id))
      .filter((emote) => emote != null);

    const favorites = emoteStorage
      .getFavorites()
      .map((id) => this.emotes.get(id))
      .filter((emote) => emote != null);

    this.conditionalProviders = [
      {
        provider: {
          id: 'favorites',
          displayName: 'Favorites',
          icon: Icons.STAR,
        },
        emotes: favorites,
      },
      {
        provider: {
          id: 'recents',
          displayName: 'Recently Used',
          icon: Icons.CLOCK,
        },
        emotes: recents,
      },
    ];
  }

  get totalRows() {
    return this.rows.length;
  }

  getProviders() {
    return this.headers.map((id) => this.getRow(id));
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
