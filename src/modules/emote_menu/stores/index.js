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
import emotesCategoryIds from './emote-categories.js';

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

const fixed = new Map();

class EmoteStore extends SafeEventEmitter {
  constructor() {
    super();

    this.rows = [];
    this.headers = [];

    this.totalCols = validateTotalColumns();

    this.emotes = new Map();

    this.defaultEmote = null;

    this.loaded = false;

    this.categories = {};
    this.categories.dependable = [];
    this.categories.extension = [];
    this.categories.fixed = [];

    watcher.on('channel.updated', async () => {
      await this.loadFixedEmotes();
      this.loadExtensionEmotes();
      this.loadDependableEmotes();
      this.createRows();
    });

    window.addEventListener('resize', () => {
      const newTotalRows = validateTotalColumns();
      if (newTotalRows !== this.totalCols) {
        this.totalCols = newTotalRows;
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
    fixed.clear();
    const twitchEmotes = await loadTwitchEmotes();
    this.categories.fixed = twitchEmotes.concat(emojiCategories);

    for (const {emotes: fixedEmotes} of this.categories.fixed) {
      fixedEmotes.forEach((emote) => fixed.set(String(emote.id), emote));
    }
  }

  loadExtensionEmotes() {
    this.categories.extension = [
      {
        provider: {
          id: emotesCategoryIds.BETTERTTV,
          displayName: 'BetterTTV',
          icon: Icons.IMAGE(cdn.url('/assets/logos/mascot.png'), 'BetterTTV'),
        },
        emotes: emotes.getEmotesByProviders(['bttv-channel', 'bttv-personal', 'bttv']),
      },
      {
        provider: {
          id: emotesCategoryIds.FRANKERFACEZ,
          displayName: 'FrankerFaceZ',
          icon: Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ'),
        },
        emotes: emotes.getEmotesByProviders(['ffz-channel', 'ffz-global']),
      },
    ];

    this.emotes = new Map(fixed);

    for (const {emotes: providerEmotes} of this.categories.extension) {
      providerEmotes.forEach((emote) => this.emotes.set(String(emote.id), emote));
    }

    const collection = [...this.emotes.values()];
    // eslint-disable-next-line prefer-destructuring
    this.defaultEmote = collection[0];
    fuse.setCollection(collection);
  }

  search(search) {
    return fuse.search(search);
  }

  loadDependableEmotes() {
    this.categories.dependable = [
      {
        provider: {
          id: emotesCategoryIds.FAVORITES,
          displayName: 'Favorites',
          icon: Icons.STAR,
        },
        emotes: Array.from(emoteStorage.getFavorites())
          .map((id) => this.emotes.get(id))
          .filter((emote) => emote != null),
      },
      {
        provider: {
          id: emotesCategoryIds.FRECENTS,
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
    this.rows = [];
    this.headers = [];

    for (const category of Object.values(this.categories)) {
      for (const {provider, emotes: providerEmotes} of category) {
        if (providerEmotes.length === 0) continue;

        this.headers.push(this.rows.length);
        this.rows = this.rows.concat([provider, ...chunkArray(providerEmotes, this.totalCols)]);
      }
    }

    this.loaded = true;
    this.emit('loaded');
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

  getProviderIndexById(id) {
    return this.headers.find((header) => this.rows[header]?.id === id);
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
}

export default new EmoteStore();
