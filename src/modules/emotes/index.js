import globalEmotes from './global-emotes.js';
import channelEmotes from './channel-emotes.js';
import personalEmotes from './personal-emotes.js';
import emojis from './emojis.js';
import frankerfacezGlobalEmotes from '../frankerfacez/global-emotes.js';
import frankerfacezChannelEmotes from '../frankerfacez/channel-emotes.js';
import settings from '../../settings.js';
import {EmoteProviders, EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';
import {getCurrentUser} from '../../utils/user.js';
import {getCurrentChannel} from '../../utils/channel.js';
import './socket-client-listeners.js';

class EmotesModule {
  constructor() {
    this.emoteCategories = [
      personalEmotes,
      channelEmotes,
      globalEmotes,
      frankerfacezGlobalEmotes,
      frankerfacezChannelEmotes,
      emojis,
    ];
  }

  getEmotes(categoryFilter = []) {
    let emotes = [];
    const emotesSettingValue = settings.get(SettingIds.EMOTES);

    for (const category of this.emoteCategories) {
      if (categoryFilter.includes(category.category.id)) {
        continue;
      }
      const categoryProvider = category.category.provider;
      if (categoryProvider === EmoteProviders.BETTERTTV && !hasFlag(emotesSettingValue, EmoteTypeFlags.BTTV_EMOTES)) {
        continue;
      }
      if (categoryProvider === EmoteProviders.FRANKERFACEZ && !hasFlag(emotesSettingValue, EmoteTypeFlags.FFZ_EMOTES)) {
        continue;
      }
      const currentUser = getCurrentUser();
      emotes = emotes.concat(
        category.getEmotes(currentUser).filter((emote) => {
          if (!emote.isUsable(null, currentUser)) {
            return false;
          }
          if (emote.imageType === 'gif' && !hasFlag(emotesSettingValue, EmoteTypeFlags.BTTV_GIF_EMOTES)) {
            return false;
          }
          return true;
        })
      );
    }

    return emotes;
  }

  getEmotesByCategories(categoryFilter = []) {
    return this.getEmotes(
      this.emoteCategories.map(({category: {id}}) => id).filter((categoryId) => !categoryFilter.includes(categoryId))
    );
  }

  getEligibleEmote(code, user) {
    const channel = getCurrentChannel();
    const emotesSettingValue = settings.get(SettingIds.EMOTES);

    for (let i = 0; i < this.emoteCategories.length; i++) {
      const category = this.emoteCategories[i];
      const categoryProvider = category.category.provider;
      if (categoryProvider === EmoteProviders.BETTERTTV && !hasFlag(emotesSettingValue, EmoteTypeFlags.BTTV_EMOTES)) {
        continue;
      }
      if (categoryProvider === EmoteProviders.FRANKERFACEZ && !hasFlag(emotesSettingValue, EmoteTypeFlags.FFZ_EMOTES)) {
        continue;
      }
      const emote = category.getEligibleEmote(code, user);
      if (!emote || !emote.isUsable(channel, user)) {
        continue;
      }
      if (emote.imageType === 'gif' && !hasFlag(emotesSettingValue, EmoteTypeFlags.BTTV_GIF_EMOTES)) {
        continue;
      }
      return emote;
    }

    return null;
  }
}

export default new EmotesModule();
