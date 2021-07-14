import twitch from '../../utils/twitch.js';
import globalEmotes from './global-emotes.js';
import channelEmotes from './channel-emotes.js';
import personalEmotes from './personal-emotes.js';
import emojis from './emojis.js';
import frankerfacezGlobalEmotes from '../frankerfacez/global-emotes.js';
import frankerfacezChannelEmotes from '../frankerfacez/channel-emotes.js';
import settings from '../../settings.js';
import {EmoteTypeFlags, SettingIds} from '../../constants.js';
import {hasFlag} from '../../utils/flags.js';

class EmotesModule {
  constructor() {
    this.emoteProviders = [
      personalEmotes,
      channelEmotes,
      globalEmotes,
      frankerfacezGlobalEmotes,
      frankerfacezChannelEmotes,
      emojis,
    ];
  }

  getEmotes(providerFilter = []) {
    let emotes = [];
    for (const provider of this.emoteProviders) {
      if (providerFilter.includes(provider.provider.id)) continue;
      const currentUser = twitch.getCurrentUser();
      emotes = emotes.concat(
        provider.getEmotes(currentUser).filter((emote) => {
          if (!emote.isUsable(null, currentUser)) return false;
          const flags = settings.get(SettingIds.EMOTES);
          if (emote.imageType === 'gif' && !hasFlag(flags, EmoteTypeFlags.BTTV_GIF_EMOTES)) return false;
          if (emote.provider.id.startsWith('bttv') && !hasFlag(flags, EmoteTypeFlags.BTTV_EMOTES)) return false;
          return true;
        })
      );
    }

    return emotes;
  }

  getEligibleEmote(code, user) {
    const channel = twitch.getCurrentChannel();

    for (let i = 0; i < this.emoteProviders.length; i++) {
      const provider = this.emoteProviders[i];
      const emote = provider.getEligibleEmote(code, user);
      if (!emote || !emote.isUsable(channel, user)) continue;
      if (emote.imageType === 'gif' && !hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.BTTV_GIF_EMOTES))
        continue;
      if (emote.provider.id.startsWith('bttv') && !hasFlag(settings.get(SettingIds.EMOTES), EmoteTypeFlags.BTTV_EMOTES))
        continue;
      return emote;
    }

    return null;
  }
}

export default new EmotesModule();
