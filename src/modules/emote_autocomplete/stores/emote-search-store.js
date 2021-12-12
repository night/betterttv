import Fuse from 'fuse.js';
import flatten from 'lodash.flatten';
import watcher from '../../../watcher.js';
import {getEmojiCategories} from '../../emote_menu/utils/emojis.js';
import emotes from '../../emotes/index.js';
import {loadTwitchEmotes} from '../../emote_menu/utils/twitch-emotes.js';
import {loadYouTubeEmotes} from '../../emote_menu/utils/youtube-emotes.js';
import settings from '../../../settings.js';
import {SettingIds, EmoteCategories, PlatformTypes} from '../../../constants.js';
import {getPlatform} from '../../../utils/window.js';

const fuse = new Fuse([], {
  keys: ['code'],
  shouldSort: true,
  threshold: 0.3,
});

class EmoteSearchStore {
  constructor() {
    watcher.on('channel.updated', () => this.updatePlatformProviders());
    settings.on(`changed.${SettingIds.DARKENED_MODE}`, () => this.updatePlatformProviders());

    watcher.on('emotes.updated', () => this.updateProviders());
    settings.on(`changed.${SettingIds.EMOTES}`, () => this.updateProviders());
  }

  async updateProviders() {
    const platformCategories =
      getPlatform() === PlatformTypes.YOUTUBE ? await loadYouTubeEmotes() : await loadTwitchEmotes();

    const providerCategories = emotes.getEmotesByCategories([
      EmoteCategories.BETTERTTV_CHANNEL,
      EmoteCategories.FRANKERFACEZ_CHANNEL,
      EmoteCategories.BETTERTTV_GLOBAL,
      EmoteCategories.BETTERTTV_PERSONAL,
      EmoteCategories.FRANKERFACEZ_GLOBAL,
    ]);

    const categories = [...platformCategories, ...getEmojiCategories()];
    const collection = [
      ...flatten(categories.map(({emotes: categoryEmotes}) => categoryEmotes)),
      ...providerCategories,
    ];

    fuse.setCollection(collection);
  }

  search(search) {
    return fuse.search(search);
  }
}

export default new EmoteSearchStore();
