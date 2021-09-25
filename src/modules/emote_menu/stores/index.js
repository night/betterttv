import Fuse from 'fuse.js';
import uniqBy from 'lodash.uniqby';
import sortBy from 'lodash.sortby';
import SafeEventEmitter from '../../../utils/safe-event-emitter.js';
import watcher from '../../../watcher.js';
import emojiCategories from './emoji-categories.js';
import emotes from '../../emotes/index.js';
import Icons from '../components/Icons.jsx';
import emoteStorage from './emote-storage.js';
import {loadTwitchEmotes} from './twitch-emotes.js';
import cdn from '../../../utils/cdn.js';
import settings from '../../../settings.js';
import {SettingIds, EmoteProviders, EmoteCategories} from '../../../constants.js';
import twitch from '../../../utils/twitch.js';

const MAX_FRECENTS = 36;

const computeTotalColumns = () => (window.innerWidth <= 400 ? 7 : 9);

function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

function createCategory(id, provider, displayName, icon, categoryEmotes = []) {
  return {
    category: {
      id,
      provider,
      displayName,
      icon,
    },
    emotes: sortBy(categoryEmotes, ({code}) => code.toLowerCase()),
  };
}

const fuse = new Fuse([], {
  keys: ['code'],
  shouldSort: true,
  threshold: 0.3,
});

let providerCategories = [];
let twitchCategories = [];

class EmoteStore extends SafeEventEmitter {
  constructor() {
    super();

    this.rows = [];
    this.headers = [];

    this.dirty = true;
    this.categories = {};

    this.totalCols = computeTotalColumns();

    watcher.on('channel.updated', () => this.updateTwitchProviders());
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, () => this.updateTwitchProviders());

    watcher.on('emotes.updated', () => this.updateProviders());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateProviders());

    window.addEventListener('resize', () => {
      this.totalCols = computeTotalColumns();
      this.markDirty(false);
    });
  }

  async updateTwitchProviders() {
    twitchCategories = await loadTwitchEmotes();
    this.markDirty(false);
  }

  async updateProviders() {
    const profilePicture = await twitch.getCurrentUserProfilePicture();

    providerCategories = [
      createCategory(
        EmoteCategories.BETTERTTV_CHANNEL,
        EmoteProviders.BETTERTTV,
        'BetterTTV',
        Icons.IMAGE(cdn.url('/assets/logos/mascot.png'), 'BetterTTV'),
        emotes.getEmotesByCategories([EmoteCategories.BETTERTTV_CHANNEL, EmoteCategories.BETTERTTV_GLOBAL])
      ),
      createCategory(
        EmoteCategories.BETTERTTV_PERSONAL,
        EmoteProviders.BETTERTTV,
        'BetterTTV Personal',
        Icons.IMAGE(profilePicture == null ? cdn.url('/assets/logos/mascot.png') : profilePicture, 'BetterTTV'),
        emotes.getEmotesByCategories([EmoteCategories.BETTERTTV_PERSONAL])
      ),
      createCategory(
        EmoteCategories.FRANKERFACEZ_CHANNEL,
        EmoteProviders.FRANKERFACEZ,
        'FrankerFaceZ',
        Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ'),
        emotes.getEmotesByCategories([EmoteCategories.FRANKERFACEZ_CHANNEL, EmoteCategories.FRANKERFACEZ_GLOBAL])
      ),
    ];
    this.markDirty(false);
  }

  search(search) {
    const results = fuse.search(search);

    if (results.length === 0) {
      return [];
    }

    return chunkArray(results, this.totalCols);
  }

  updateEmotes() {
    this.rows = [];
    this.headers = [];

    const frecents = createCategory(EmoteCategories.FRECENTS, null, 'Frequently Used', Icons.CLOCK, []);
    const favorites = createCategory(EmoteCategories.FAVORITES, null, 'Favorites', Icons.STAR, []);

    const categories = [...providerCategories, ...twitchCategories, ...emojiCategories];
    const collection = [];

    for (const category of categories) {
      if (category.emotes.length === 0) {
        continue;
      }

      for (const emote of category.emotes) {
        const emoteCanonicalId = emote.canonicalId;
        if (emoteStorage.favorites.includes(emoteCanonicalId)) {
          favorites.emotes.push(emote);
        }
        if (emoteStorage.frecents.includes(emoteCanonicalId)) {
          frecents.emotes.push(emote);
        }
      }

      this.headers.push(this.rows.length);
      const chunkedEmotes = chunkArray(category.emotes, this.totalCols);
      this.rows.push(category.category, ...chunkedEmotes);
      collection.push(...category.emotes);
    }

    if (frecents.emotes.length > 0) {
      frecents.emotes = sortBy(
        uniqBy(frecents.emotes, (emote) => emote.canonicalId),
        (emote) => emoteStorage.frecents.indexOf(emote.canonicalId)
      ).slice(0, MAX_FRECENTS);
      const frecentsChunked = chunkArray(frecents.emotes, this.totalCols);
      this.rows.unshift(frecents.category, ...frecentsChunked);
      this.headers = this.headers.map((index) => index + frecentsChunked.length + 1);
      this.headers.unshift(0);
    }

    if (favorites.emotes.length > 0) {
      favorites.emotes = sortBy(
        uniqBy(favorites.emotes, (emote) => emote.canonicalId),
        (emote) => emoteStorage.favorites.indexOf(emote.canonicalId)
      );
      const favoritesChunked = chunkArray(favorites.emotes, this.totalCols);
      this.rows.unshift(favorites.category, ...favoritesChunked);
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

  getCategories() {
    return this.headers.map((id) => this.rows[id]);
  }

  getCategoryIndexById(id) {
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
    const emoteCanonicalId = emote.canonicalId;
    emoteStorage.setFavorite(emoteCanonicalId, !emoteStorage.favorites.includes(emoteCanonicalId));
    this.markDirty(forceUpdate);
  }

  trackHistory(emote, forceUpdate = false) {
    emoteStorage.trackHistory(emote);
    this.markDirty(forceUpdate);
  }

  hasFavorite(emote) {
    return emoteStorage.favorites.includes(emote.canonicalId);
  }
}

export default new EmoteStore();
