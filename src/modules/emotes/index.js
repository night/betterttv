import twitch from '../../utils/twitch';
import globalEmotes from './global-emotes';
import channelEmotes from './channel-emotes';
import personalEmotes from './personal-emotes';
import emojis from './emojis';
import frankerfacezGlobalEmotes from '../frankerfacez/global-emotes';
import frankerfacezChannelEmotes from '../frankerfacez/channel-emotes';
import settings from '../../settings';

class EmotesModule {
    constructor() {
        this.emoteProviders = [
            personalEmotes,
            globalEmotes,
            channelEmotes,
            frankerfacezGlobalEmotes,
            frankerfacezChannelEmotes,
            emojis
        ];

        settings.add({
            id: 'bttvEmotes',
            name: 'BetterTTV Emotes',
            defaultValue: true,
            description: 'Adds extra cool emotes for you to use'
        });

        settings.add({
            id: 'bttvGIFEmotes',
            name: 'BetterTTV GIF Emotes',
            defaultValue: true,
            description: 'Adds animated emotes (not everyone likes GIFs, but some people do)'
        });
    }

    getEmotes(providerFilter = []) {
        let emotes = [];
        for (const provider of this.emoteProviders) {
            if (providerFilter.includes(provider.provider.id)) continue;
            const currentUser = twitch.getCurrentUser();
            emotes = emotes.concat(
                provider.getEmotes(currentUser)
                    .filter(emote => {
                        if (!emote.isUsable(null, currentUser)) return false;
                        if (emote.imageType === 'gif' && settings.get('bttvGIFEmotes') === false) return false;
                        if (emote.provider.id.startsWith('bttv') && settings.get('bttvEmotes') === false) return false;
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
            if (emote.imageType === 'gif' && settings.get('bttvGIFEmotes') === false) continue;
            if (emote.provider.id.startsWith('bttv') && settings.get('bttvEmotes') === false) continue;
            return emote;
        }

        return null;
    }
}

export default new EmotesModule();
