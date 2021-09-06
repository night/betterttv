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
import {SettingIds, emotesCategoryIds} from '../../../constants.js';
import twitch from '../../../utils/twitch.js';

const MAX_FRECENTS = 54;

const computeTotalColumns = () => (window.innerWidth <= 400 ? 7 : 9);

function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

function createCategory(id, displayName, icon, categoryEmotes = []) {
  return {
    provider: {
      id,
      displayName,
      icon,
    },
    emotes: categoryEmotes,
  };
}

const fuse = new Fuse([], {
  keys: ['code'],
  shouldSort: true,
  threshold: 0.3,
});

let emoteProviderCategories = [];
let twitchCategories = [];
let totalCols = computeTotalColumns();

class EmoteStore extends SafeEventEmitter {
  constructor() {
    super();

    this.rows = [];
    this.headers = [];

    this.dirty = true;
    this.categories = {};

    watcher.on('channel.updated', () => this.updateTwitchProviders());
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, () => this.updateTwitchProviders());

    watcher.on('emotes.updated', () => this.updateEmoteProviders());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateEmoteProviders());

    window.addEventListener('resize', () => {
      totalCols = computeTotalColumns();
      this.markDirty(false);
    });
  }

  async updateTwitchProviders() {
    twitchCategories = await loadTwitchEmotes();
    this.markDirty(false);
  }

  async updateEmoteProviders() {
    const currentUser = await twitch.getCurrentProfile();

    emoteProviderCategories = [
      createCategory(
        emotesCategoryIds.BETTERTTV,
        'BetterTTV',
        Icons.IMAGE(cdn.url('/assets/logos/mascot.png'), 'BetterTTV'),
        emotes.getEmotesByProviders(['bttv-channel', 'bttv'])
      ),
      createCategory(
        emotesCategoryIds.BETTERTTV_PERSONAL,
        'BetterTTV Personal',
        Icons.IMAGE(currentUser?.logo == null ? cdn.url('/assets/logos/mascot.png') : currentUser.logo, 'BetterTTV'),
        emotes.getEmotesByProviders(['bttv-personal'])
      ),
      createCategory(
        emotesCategoryIds.FRANKERFACEZ,
        'FrankerFaceZ',
        Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ'),
        emotes.getEmotesByProviders(['ffz-channel', 'ffz-global'])
      ),
    ];
    this.markDirty(false);
  }

  search(search) {
    const results = fuse.search(search);
    return results.length > 0 ? chunkArray(results, totalCols) : [];
  }

  updateEmotes() {
    this.rows = [];
    this.headers = [];

    const frecents = createCategory(emotesCategoryIds.FRECENTS, 'Frequently Used', Icons.CLOCK, []);
    const favorites = createCategory(emotesCategoryIds.FAVORITES, 'Favorites', Icons.STAR, []);

    const categories = [...emoteProviderCategories, ...twitchCategories, ...emojiCategories];
    const collection = [];

    for (const category of categories) {
      if (category.emotes.length === 0) {
        continue;
      }

      for (const emote of category.emotes) {
        if (emoteStorage.favorites.has(String(emote.id))) {
          favorites.emotes.push(emote);
        }

        if (emoteStorage.frecents.has(String(emote.id))) {
          frecents.emotes.push(emote);
        }
      }

      this.headers.push(this.rows.length);
      this.rows.push(category.provider, ...chunkArray(category.emotes, totalCols));
      collection.push(...category.emotes);
    }

    if (frecents.emotes.length > 0) {
      const frecentsChunked = chunkArray(frecents.emotes.splice(0, MAX_FRECENTS), totalCols);
      this.rows.unshift(frecents.provider, ...frecentsChunked);
      this.headers = this.headers.map((index) => index + frecentsChunked.length + 1);
      this.headers.unshift(0);
    }

    if (favorites.emotes.length > 0) {
      const favoritesChunked = chunkArray(favorites.emotes, totalCols);
      this.rows.unshift(favorites.provider, ...favoritesChunked);
      this.headers = this.headers.map((index) => index + favoritesChunked.length + 1);
      this.headers.unshift(0);
    }

    fuse.setCollection(collection);
    this.dirty = false;
    this.emit('updated');
  }

  getRow(index) {
    return this.rows[index];
  }

  getProviders() {
    return this.headers.map((id) => this.rows[id]);
  }

  getProviderIndexById(id) {
    return this.headers.find((header) => this.rows[header]?.id === id);
  }

  markDirty(forceUpdate = false) {
    this.dirty = true;
    if (forceUpdate) {
      this.updateEmotes();
    } else {
      this.emit('dirty');
    }
  }

  isLoaded() {
    if (this.dirty) {
      this.updateEmotes();
    }
    return !this.dirty;
  }

  toggleFavorite(emote, forceUpdate = false) {
    emoteStorage.setFavorite(emote, !emoteStorage.favorites.has(String(emote.id)));
    this.markDirty(forceUpdate);
  }

  trackHistory(emote, forceUpdate = false) {
    emoteStorage.trackHistory(emote);
    this.markDirty(forceUpdate);
  }
}

export default new EmoteStore();
