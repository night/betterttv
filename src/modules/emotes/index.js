import {EmoteProviders, EmoteTypeFlags, SettingIds} from '@/constants';
import frankerfacezChannelEmotes from '@/modules/frankerfacez/channel-emotes';
import frankerfacezGlobalEmotes from '@/modules/frankerfacez/global-emotes';
import seventvChannelEmotes from '@/modules/seventv/channel-emotes';
import seventvGlobalEmotes from '@/modules/seventv/global-emotes';
import settings from '@/settings';
import {getCurrentChannel} from '@/utils/channel';
import {hasFlag} from '@/utils/flags';
import {getCurrentUser} from '@/utils/user';
import channelEmotes from './channel-emotes';
import emojis from './emojis';
import globalEmotes from './global-emotes';
import personalEmotes from './personal-emotes';

class EmotesModule {
  constructor() {
    this.emoteCategories = [
      personalEmotes,
      channelEmotes,
      globalEmotes,
      frankerfacezGlobalEmotes,
      frankerfacezChannelEmotes,
      seventvChannelEmotes,
      seventvGlobalEmotes,
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
      if (categoryProvider === EmoteProviders.SEVENTV && !hasFlag(emotesSettingValue, EmoteTypeFlags.SEVENTV_EMOTES)) {
        continue;
      }
      const currentUser = getCurrentUser();
      emotes = emotes.concat(
        category.getEmotes(currentUser).filter((emote) => {
          if (!emote.isUsable(null, currentUser)) {
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
      if (categoryProvider === EmoteProviders.SEVENTV && !hasFlag(emotesSettingValue, EmoteTypeFlags.SEVENTV_EMOTES)) {
        continue;
      }
      const emote = category.getEligibleEmote(code, user);
      if (!emote || !emote.isUsable(channel, user)) {
        continue;
      }
      return emote;
    }

    return null;
  }
}

export default new EmotesModule();
