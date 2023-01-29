import Fuse from 'fuse.js';
import uniqBy from 'lodash.uniqby';
import sortBy from 'lodash.sortby';
import {v4 as uuidv4} from 'uuid';
import SafeEventEmitter from '../../utils/safe-event-emitter.js';
import watcher from '../../watcher.js';
import {getEmojiCategories} from '../../modules/emote_menu/utils/emojis.js';
import emotes from '../../modules/emotes/index.js';
import Icons from '../../modules/emote_menu/components/Icons.jsx';
import emoteStorage from '../../modules/emote_menu/stores/emote-menu-store.js';
import {loadTwitchEmotes} from '../../modules/emote_menu/utils/twitch-emotes.js';
import {loadYouTubeEmotes} from '../../modules/emote_menu/utils/youtube-emotes.js';
import cdn from '../../utils/cdn.js';
import {getCurrentChannel} from '../../utils/channel.js';
import settings from '../../settings.js';
import {
  SettingIds,
  EmoteProviders,
  EmoteCategories,
  PlatformTypes,
  EMOTE_CATEGORIES_ORDER_STORAGE_KEY,
} from '../../constants.js';
import twitch from '../../utils/twitch.js';
import {getPlatform} from '../../utils/window.js';
import {getCurrentUser} from '../../utils/user.js';
import storage from '../../storage.js';
import formatMessage from '../../i18n/index.js';

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

let categoryOrder = storage.get(EMOTE_CATEGORIES_ORDER_STORAGE_KEY) ?? [];

function organizeCategories(categories) {
  if (categoryOrder == null) {
    return categories;
  }

  return categories.sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.category.id);
    const bIndex = categoryOrder.indexOf(b.category.id);
    if (aIndex === -1 || bIndex === -1) {
      return 0;
    }
    return aIndex - bIndex;
  });
}

const fuse = new Fuse([], {
  keys: ['code'],
  shouldSort: true,
  threshold: 0.3,
});

let providerCategories = [];
let platformCategories = [];

const registeredProviders = {};
const registeredProviderCategories = {};

export const CategoryPositions = {
  BOTTOM: 0,
  MIDDLE: 1,
  TOP: 2,
};

let topCategories = [];
let middleCategories = [];
let bottomCategories = [];

class EmoteMenuViewStore extends SafeEventEmitter {
  constructor() {
    super();

    this.rows = [];
    this.headers = [];

    this.dirty = true;
    this.categories = {};

    this.totalCols = computeTotalColumns();

    watcher.on('channel.updated', () => this.updatePlatformProviders());
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, () => this.updatePlatformProviders());

    watcher.on('emotes.updated', () => this.updateProviders());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateProviders());

    window.addEventListener('resize', () => {
      this.totalCols = computeTotalColumns();
      this.markDirty(false);
    });
  }

  async updatePlatformProviders() {
    platformCategories = getPlatform() === PlatformTypes.YOUTUBE ? await loadYouTubeEmotes() : await loadTwitchEmotes();
    this.markDirty(false);
  }

  registerProvider(provider) {
    const registeredProviderId = uuidv4();
    registeredProviders[registeredProviderId] = provider;
    return registeredProviderId;
  }

  getRegisteredProvider(providerId) {
    return registeredProviders[providerId];
  }

  upsertRegisteredProviderCategory({id, ...category}) {
    registeredProviderCategories[id] = {id, ...category};
    this.updateProviders();
  }

  deleteRegisteredProviderCategory(id) {
    delete registeredProviderCategories[id];
    this.updateProviders();
  }

  async updateProviders() {
    const currentChannel = getCurrentChannel();
    const betterttvChannelEmotes = emotes.getEmotesByCategories([EmoteCategories.BETTERTTV_CHANNEL]);
    const frankerfacezChannelEmotes = emotes.getEmotesByCategories([EmoteCategories.FRANKERFACEZ_CHANNEL]);
    let currentChannelProfilePicture = currentChannel?.avatar;
    if (
      getPlatform() === PlatformTypes.TWITCH &&
      currentChannel != null &&
      (betterttvChannelEmotes.length > 0 || frankerfacezChannelEmotes.length > 0)
    ) {
      currentChannelProfilePicture = await twitch.getUserProfilePicture(currentChannel.id);
    }

    const currentUser = getCurrentUser();
    const betterttvPersonalEmotes = emotes.getEmotesByCategories([EmoteCategories.BETTERTTV_PERSONAL]);
    let currentUserProfilePicture = currentUser?.avatar;
    if (getPlatform() === PlatformTypes.TWITCH && betterttvPersonalEmotes.length > 0) {
      currentUserProfilePicture = await twitch.getUserProfilePicture();
    }

    providerCategories = [
      createCategory(
        EmoteCategories.BETTERTTV_CHANNEL,
        EmoteProviders.BETTERTTV,
        formatMessage({defaultMessage: 'BetterTTV Channel'}),
        Icons.IMAGE(cdn.url('/assets/logos/emote_menu_logo.svg'), 'BetterTTV', currentChannelProfilePicture),
        betterttvChannelEmotes
      ),
      createCategory(
        EmoteCategories.BETTERTTV_PERSONAL,
        EmoteProviders.BETTERTTV,
        formatMessage({defaultMessage: 'BetterTTV Personal'}),
        Icons.IMAGE(cdn.url('/assets/logos/emote_menu_logo.svg'), 'BetterTTV', currentUserProfilePicture),
        betterttvPersonalEmotes
      ),
      createCategory(
        EmoteCategories.BETTERTTV_GLOBAL,
        EmoteProviders.BETTERTTV,
        formatMessage({defaultMessage: 'BetterTTV Global'}),
        Icons.IMAGE(cdn.url('/assets/logos/emote_menu_logo.svg'), 'BetterTTV'),
        emotes.getEmotesByCategories([EmoteCategories.BETTERTTV_GLOBAL])
      ),
      createCategory(
        EmoteCategories.FRANKERFACEZ_CHANNEL,
        EmoteProviders.FRANKERFACEZ,
        formatMessage({defaultMessage: 'FrankerFaceZ Channel'}),
        Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ', currentChannelProfilePicture),
        frankerfacezChannelEmotes
      ),
      createCategory(
        EmoteCategories.FRANKERFACEZ_GLOBAL,
        EmoteProviders.FRANKERFACEZ,
        formatMessage({defaultMessage: 'FrankerFaceZ Global'}),
        Icons.IMAGE(cdn.url('/assets/logos/ffz_logo.png'), 'FrankerFaceZ'),
        emotes.getEmotesByCategories([EmoteCategories.FRANKERFACEZ_GLOBAL])
      ),
      createCategory(
        EmoteCategories.SEVENTV_CHANNEL,
        EmoteProviders.SEVENTV,
        formatMessage({defaultMessage: '7TV Channel'}),
        Icons.IMAGE(cdn.url('/assets/logos/7tv_logo.png'), '7TV', currentChannelProfilePicture),
        emotes.getEmotesByCategories([EmoteCategories.SEVENTV_CHANNEL])
      ),
      createCategory(
        EmoteCategories.SEVENTV_GLOBAL,
        EmoteProviders.SEVENTV,
        formatMessage({defaultMessage: '7TV Global'}),
        Icons.IMAGE(cdn.url('/assets/logos/7tv_logo.png'), '7TV'),
        emotes.getEmotesByCategories([EmoteCategories.SEVENTV_GLOBAL])
      ),
    ];

    for (const [registeredCategoryId, registeredCategory] of Object.entries(registeredProviderCategories)) {
      if (registeredCategory?.channelId != null && registeredCategory?.channelId !== currentChannel?.id) {
        continue;
      }
      const provider = this.getRegisteredProvider(registeredCategory.providerId);
      if (provider == null) {
        continue;
      }
      const category = createCategory(
        registeredCategoryId,
        registeredCategory.providerId,
        registeredCategory.channelId == null
          ? formatMessage({defaultMessage: '{displayName} Global'}, {displayName: provider.displayName})
          : formatMessage({defaultMessage: '{displayName} Channel'}, {displayName: provider.displayName}),
        registeredCategory.channelId == null
          ? Icons.IMAGE(provider.iconSrc, provider.displayName)
          : Icons.IMAGE(provider.iconSrc, provider.displayName, currentChannelProfilePicture),
        registeredCategory.emotes
      );
      providerCategories.push(category);
    }

    this.markDirty(false);
  }

  search(search) {
    return fuse.search(search);
  }

  updateEmotes() {
    if (!this.dirty) {
      return;
    }

    this.rows = [];
    this.headers = [];

    const frecents = createCategory(
      EmoteCategories.FRECENTS,
      null,
      formatMessage({defaultMessage: 'Frequently Used'}),
      Icons.CLOCK,
      []
    );
    const favorites = createCategory(
      EmoteCategories.FAVORITES,
      null,
      formatMessage({defaultMessage: 'Favorites'}),
      Icons.STAR,
      []
    );

    const collection = [];
    const emojiCategories = getEmojiCategories();
    const categories = organizeCategories(
      [...providerCategories, ...platformCategories].filter((category) => category.emotes.length > 0)
    );

    topCategories = [];
    middleCategories = categories.map(({category}) => category);
    bottomCategories = emojiCategories.map(({category}) => category);

    for (const category of [...categories, ...emojiCategories]) {
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
      topCategories.unshift(frecents.category);
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
      topCategories.unshift(favorites.category);
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

  setCategoryOrder(categories) {
    categoryOrder = categories.map(({id}) => id);
    storage.set(EMOTE_CATEGORIES_ORDER_STORAGE_KEY, categoryOrder);
    this.markDirty();
  }

  getRow(index) {
    return this.rows[index];
  }

  getCategories(type) {
    switch (type) {
      case CategoryPositions.BOTTOM:
        return bottomCategories;
      case CategoryPositions.TOP:
        return topCategories;
      case CategoryPositions.MIDDLE:
        return middleCategories;
      default:
        throw new Error('getCategories() requires a type');
    }
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

export default new EmoteMenuViewStore();
