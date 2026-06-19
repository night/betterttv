import Fuse from 'fuse.js';
import chunk from 'lodash.chunk';
import sortBy from 'lodash.sortby';
import uniqBy from 'lodash.uniqby';
import {
  SettingIds,
  EmoteProviders,
  EmoteCategories,
  PlatformTypes,
  EMOTE_CATEGORIES_ORDER_STORAGE_KEY,
} from '@/constants';
import formatMessage from '@/i18n/index';
import Icons from '@/modules/emote_menu/components/Icons';
import emoteStorage from '@/modules/emote_menu/stores/emote-menu-store';
import {getEmojiCategories} from '@/modules/emote_menu/utils/emojis';
import {loadTwitchEmotes} from '@/modules/emote_menu/utils/twitch-emotes';
import {loadYouTubeEmotes} from '@/modules/emote_menu/utils/youtube-emotes';
import emotes from '@/modules/emotes/index';
import settings from '@/settings';
import storage from '@/storage';
import cdn from '@/utils/cdn';
import {getCurrentChannel} from '@/utils/channel';
import SafeEventEmitter from '@/utils/safe-event-emitter';
import twitch from '@/utils/twitch';
import {getCurrentUser} from '@/utils/user';
import {getPlatform} from '@/utils/window';
import watcher from '@/watcher';

const MAX_FRECENTS = 36;

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

// Parses a search query for a `c:<channel>` prefix used to filter emotes by channel.
// Returns the channel filter (or null) and the remaining search term.
const CHANNEL_QUERY_REGEX = /^c:(\S+)\s*(.*)$/i;
function parseSearchQuery(search) {
  const match = search.match(CHANNEL_QUERY_REGEX);
  if (match == null) {
    return {channel: null, term: search};
  }
  return {channel: match[1].toLowerCase(), term: match[2]};
}

function emoteMatchesChannel(emote, channelQuery) {
  const {channel} = emote;
  if (channel == null) {
    return false;
  }
  return (
    (channel.name != null && channel.name.toLowerCase().includes(channelQuery)) ||
    (channel.displayName != null && channel.displayName.toLowerCase().includes(channelQuery))
  );
}

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

const EMOTE_MENU_WINDOW_MARGIN = 16;
const EMOTE_MENU_COLUMN_WIDTH = 36;
export const EMOTE_MENU_MIN_WIDTH = 300;

class EmoteMenuViewStore extends SafeEventEmitter {
  constructor() {
    super();

    this.rows = [];
    this.headers = [];
    this.collection = [];

    this.dirty = true;
    this.categories = {};

    this.updateTotalColumns();

    watcher.on('channel.updated', () => this.updatePlatformProviders());
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, () => this.updatePlatformProviders());

    watcher.on('emotes.updated', () => this.updateProviders());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateProviders());
  }

  updateTotalColumns(width = 300) {
    let cols;

    if (window.innerWidth < width) {
      cols = Math.floor((window.innerWidth - EMOTE_MENU_WINDOW_MARGIN) / EMOTE_MENU_COLUMN_WIDTH);
    } else {
      cols = Math.floor((width - EMOTE_MENU_WINDOW_MARGIN) / EMOTE_MENU_COLUMN_WIDTH);
    }

    if (this.totalCols === cols) {
      return;
    }

    this.totalCols = Math.max(1, cols);
    this.markDirty(false);
  }

  async updatePlatformProviders() {
    platformCategories = getPlatform() === PlatformTypes.YOUTUBE ? await loadYouTubeEmotes() : await loadTwitchEmotes();
    this.markDirty(false);
  }

  registerProvider(provider) {
    const registeredProviderId =
      window.crypto != null && window.crypto.randomUUID != null
        ? window.crypto.randomUUID()
        : provider.displayName.toLowerCase().replace(/\s+/g, '-');
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

  search(search, chunkResults = true) {
    if (search == null || search.length === 0) {
      return [];
    }

    const {channel: channelQuery, term} = parseSearchQuery(search);

    let items;
    if (channelQuery != null) {
      const channelEmotes = this.collection.filter((emote) => emoteMatchesChannel(emote, channelQuery));

      if (term.length === 0) {
        items = sortBy(channelEmotes, ({code}) => code.toLowerCase());
      } else {
        const channelFuse = new Fuse(channelEmotes, {keys: ['code'], shouldSort: true, threshold: 0.3});
        items = channelFuse.search(term).map(({item}) => item);
      }
    } else {
      items = fuse.search(search).map(({item}) => item);
    }

    return chunkResults ? chunk(items, this.totalCols) : items;
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
        const canonicalId = emote.canonicalId;

        if (emoteStorage.favorites.includes(canonicalId)) {
          const favoriteEmote = emote.clone({parentCategory: favorites.category});
          favorites.emotes.push(favoriteEmote);
        }

        if (emoteStorage.frecents.includes(canonicalId)) {
          const frequentEmote = emote.clone({parentCategory: frecents.category});
          frecents.emotes.push(frequentEmote);
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

    this.collection = collection;
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
