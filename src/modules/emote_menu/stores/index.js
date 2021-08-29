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

const computeTotalColumns = () => (window.innerWidth <= 400 ? 7 : 9);

function chunkArray(array, size) {
  if (array.length <= size) {
    return [array];
  }
  return [array.slice(0, size), ...chunkArray(array.slice(size), size)];
}

function createCategory(id, displayName, icon, emotes = []) {
  return {
    provider: {
      id,
      displayName,
      icon,
    },
    emotes,
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

    watcher.on('channel.updated', async () => {
      twitchCategories = await loadTwitchEmotes();
      this.markDirty(false);
    });

    watcher.on('emotes.updated', () => this.updateEmoteProviders());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateEmoteProviders());

    window.addEventListener('resize', () => {
      totalCols = computeTotalColumns();
      this.markDirty(false);
    });
  }

  updateEmoteProviders() {
    emoteProviderCategories = [
      createCategory(
        emotesCategoryIds.BETTERTTV,
        'BetterTTV',
        Icons.IMAGE(cdn.url('/assets/logos/mascot.png'), 'BetterTTV'),
        emotes.getEmotesByProviders(['bttv-channel', 'bttv-personal', 'bttv'])
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
    return fuse.search(search);
  }

  updateEmotes() {
    this.rows = [];
    this.headers = [];

    const categories = [...emoteProviderCategories, ...twitchCategories, ...emojiCategories];

    const collection = [];

    for (const category of categories) {
      if (category.emotes.length === 0) {
        continue;
      }

      this.headers.push(this.rows.length);
      this.rows.push(category.provider, ...chunkArray(category.emotes, totalCols));
      collection.push(...category.emotes);
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

  toggleFavorite(emote) {
    emoteStorage.setFavorite(emote, !emoteStorage.getFavorites().has(String(emote.id)));
    this.markDirty(true);
  }

  trackHistory(emote, forceUpdate = false) {
    emoteStorage.trackHistory(emote);
    this.markDirty(forceUpdate);
  }
}

export default new EmoteStore();
