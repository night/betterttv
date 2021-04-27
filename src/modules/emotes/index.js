import twitch from '../../utils/twitch.js';
import globalEmotes from './global-emotes.js';
import channelEmotes from './channel-emotes.js';
import personalEmotes from './personal-emotes.js';
import emojis from './emojis.js';
import frankerfacezGlobalEmotes from '../frankerfacez/global-emotes.js';
import frankerfacezChannelEmotes from '../frankerfacez/channel-emotes.js';
import settings from '../../settings.js';

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

    settings.add({
      id: 'emotes',
      type: 2,
      options: {
        choices: ['BetterTTV Emotes', 'BetterTTV Animated Emotes', 'FrankerFaceZ Emotes'],
      },
      category: 'chat',
      name: 'Emotes',
      defaultValue: [0, 1, 2],
      description: 'Add extra emotes to chat',
    });

    settings.on('changed.emotes', () => settings.emit('changed.ffzEmotes'));
  }

  getEmotes(providerFilter = []) {
    let emotes = [];
    const values = settings.get('emotes');
    for (const provider of this.emoteProviders) {
      if (providerFilter.includes(provider.provider.id)) continue;
      const currentUser = twitch.getCurrentUser();
      emotes = emotes.concat(
        provider.getEmotes(currentUser).filter((emote) => {
          if (!emote.isUsable(null, currentUser)) return false;
          if (emote.imageType === 'gif' && !values.includes(1)) return false;
          if (emote.provider.id.startsWith('bttv') && !values.includes(0)) return false;
          return true;
        })
      );
    }

    return emotes;
  }

  getEligibleEmote(code, user) {
    const channel = twitch.getCurrentChannel();
    const values = settings.get('emotes');
    for (let i = 0; i < this.emoteProviders.length; i++) {
      const provider = this.emoteProviders[i];
      const emote = provider.getEligibleEmote(code, user);
      if (!emote || !emote.isUsable(channel, user)) continue;
      if (emote.imageType === 'gif' && !values.includes(1)) continue;
      if (emote.provider.id.startsWith('bttv') && !values.includes(0)) continue;
      return emote;
    }

    return null;
  }
}

export default new EmotesModule();
