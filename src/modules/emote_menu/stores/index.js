import Fuse from 'fuse.js';
import SafeEventEmitter from '../../../utils/safe-event-emitter.js';
import watcher from '../../../watcher.js';
import emojiCategories from './emoji-categories.js';
import emotes from '../../emotes/index.js';
import Icons from '../components/Icons.jsx';
import emoteStorage from './emote-storage.js';
import {loadTwitchEmotes} from './twitch-emotes.js';
import cdn from '../../../utils/cdn.js';
import settings from '../../../settings.js';
import {SettingIds} from '../../../constants.js';

const MAXIMUM_VISIBLE_FREQUENTLY_USED = 27;

const validateTotalColumns = () => (window.innerWidth <= 400 ? 7 : 9);

function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

const fuse = new Fuse([], {
  keys: ['code'],
  shouldSort: true,
  threshold: 0.3,
});

class EmoteStore extends SafeEventEmitter {
  constructor() {
    super();

    this.totalCols = null;

    this.providers = {
      dependable: [], // emote dependent emotes
      extension: [], // channel dependent emotes
      fixed: [], // emotes that wont change
    };

    watcher.on('channel.updated', async () => {
      await this.loadFixedEmotes();
      this.loadExtensionEmotes();
      this.loadDependableEmotes();
      this.createRows();
    });

    window.addEventListener('resize', () => {
      if (validateTotalColumns() !== this.totalCols) {
        this.createRows();
      }
    });

    settings.on(`changed.${SettingIds.EMOTES}`, () => {
      this.loadExtensionEmotes();
      this.loadDependableEmotes();
      this.createRows();
    });
  }

  async loadFixedEmotes() {
    if (this.providers.fixed.length > 0) return; // constants already been loaded
    this.constants = new Map();
    const twitchEmotes = await loadTwitchEmotes();
    this.providers.fixed = twitchEmotes.concat(emojiCategories);

    for (const {emotes: fixedEmotes} of this.providers.fixed) {
      fixedEmotes.forEach((emote) => this.constants.set(String(emote.id), emote));
    }
  }

  loadExtensionEmotes() {
    this.providers.extension = [
      {
        provider: {
          id: 'bttv',
          displayName: 'BetterTTV',
          icon: Icons.IMAGE(cdn.url('/assets/logos/mascot.png'), 'BetterTTV'),
        },
        emotes: emotes.getEmotes(['ffz-channel', 'ffz-global', 'bttv-emoji']),
      },
      {
        provider: {
          id: 'ffz',
          displayName: 'FrankerFaceZ',
          icon: Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ'),
        },
        emotes: emotes.getEmotes(['bttv-channel', 'bttv-personal', 'bttv', 'bttv-emoji']),
      },
    ];

    this.emotes = new Map(this.constants);

    for (const {emotes: providerEmotes} of this.providers.extension) {
      providerEmotes.forEach((emote) => this.emotes.set(String(emote.id), emote));
    }

    const collection = [...this.emotes.values()];
    [this.defaultEmote] = collection;
    fuse.setCollection(collection);
  }

  loadDependableEmotes() {
    this.providers.dependable = [
      {
        provider: {
          id: 'favorites',
          displayName: 'Favorites',
          icon: Icons.STAR,
        },
        emotes: Array.from(emoteStorage.getFavorites())
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
          .filter((emote) => emote != null)
          .slice(0, MAXIMUM_VISIBLE_FREQUENTLY_USED),
      },
    ];
  }

  createRows() {
    this.totalCols = validateTotalColumns();
    this.rows = [];
    this.headers = [];

    for (const providers of Object.values(this.providers)) {
      for (const {provider, emotes: providerEmotes} of providers) {
        if (providerEmotes.length === 0) continue;

        this.headers.push(this.rows.length);
        this.rows = this.rows.concat([provider, ...chunkArray(providerEmotes, this.totalCols)]);
      }
    }

    this.loaded = true;
    this.emit('loaded');
  }

  isLoaded() {
    return this.loaded;
  }

  toggleFavorite(emote) {
    emoteStorage.setFavorite(emote, !emoteStorage.getFavorites().has(String(emote.id)));

    this.loadDependableEmotes();
    this.createRows();
  }

  trackHistory(emote) {
    emoteStorage.trackHistory(emote);
  }

  getDefaultEmote() {
    return this.defaultEmote;
  }

  search(search) {
    return fuse.search(search);
  }

  getRow(index) {
    return this.rows[index];
  }

  totalRows() {
    return this.rows.length;
  }

  getProviders() {
    return this.headers.map((id) => this.rows[id]);
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
}

export default new EmoteStore();
