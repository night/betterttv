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
import cdn from '../../../utils/cdn.js';

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
    this.constants = new Map(); // non-channel dependent emotes

    for (const {emotes} of [...twitchEmotes.getEmoteSets(), ...emojiCategories]) {
      emotes.forEach((emote) => this.constants.set(String(emote.id), emote));
    }

    watcher.on('channel.updated', () => {
      this.load();
      this.loadConditionalEmotes();
      this.createRows();
    });
  }

  load() {
    this.providers = [
      {
        provider: {
          id: 'bttv',
          displayName: 'BetterTTV',
          icon: Icons.IMAGE(cdn.url('/assets/logos/mascot.png'), 'BetterTTV'),
        },
        emotes: [...channelEmotes.getEmotes(), ...globalEmotes.getEmotes()],
      },
      {
        provider: {
          id: 'ffz',
          displayName: 'FrankerFaceZ',
          icon: Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ'),
        },
        emotes: [...ffzChannelEmotes.getEmotes(), ...ffzGlobalEmotes.getEmotes()],
      },
    ];

    this.emotes = this.constants;

    for (const {emotes} of this.providers) {
      emotes.forEach((emote) => this.emotes.set(String(emote.id), emote));
    }

    fuse.setCollection([...this.emotes.values()]);
  }

  loadConditionalEmotes() {
    this.conditionalProviders = [
      {
        provider: {
          id: 'favorites',
          displayName: 'Favorites',
          icon: Icons.STAR,
        },
        emotes: emoteStorage
          .getFavorites()
          .map((id) => this.emotes.get(id))
          .filter((emote) => emote != null),
      },
      {
        provider: {
          id: 'recents',
          displayName: 'Frequently Used',
          icon: Icons.CLOCK,
        },
        emotes: emoteStorage
          .getFrecents()
          .map((id) => this.emotes.get(id))
          .filter((emote) => emote != null),
      },
    ];
  }

  createRows() {
    this.rows = [];
    this.headers = [];

    for (const {provider, emotes} of [
      ...this.conditionalProviders,
      ...this.providers,
      ...twitchEmotes.getEmoteSets(),
      ...emojiCategories,
    ]) {
      if (emotes.length === 0) continue;

      this.headers.push(this.rows.length);
      this.rows = this.rows.concat([provider, ...chunkArray(emotes, COLOUMN_COUNT)]);
    }

    this.emit('updated');
  }

  toggleFavorite(emote) {
    emoteStorage.setFavorite(emote, !emoteStorage.getFavorites().includes(emote.id));

    this.loadConditionalEmotes();
    this.createRows();
  }

  search(search) {
    return fuse.search(search);
  }

  trackHistory(emote) {
    emoteStorage.trackHistory(emote);
  }

  get totalRows() {
    return this.rows.length;
  }

  getProviders() {
    return this.headers.map((id) => this.rows[id]);
  }

  getRow(index) {
    return this.rows[index];
  }

  getHeaders() {
    return this.headers;
  }

  getHeader(index) {
    return this.rows[this.headers[index]];
  }

  getHeaderIndexById(id) {
    return this.headers.find((header) => this.rows[header]?.id === id);
  }

  isHeader(index) {
    return this.headers.includes(index);
  }
}

export default new EmoteStore();
