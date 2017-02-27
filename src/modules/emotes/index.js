const twitch = require('../../utils/twitch');
const globalEmotes = require('./global-emotes');
const channelEmotes = require('./channel-emotes');
const settings = require('../../settings');

class EmotesModule {
    constructor() {
        this.emoteProviders = [
            channelEmotes,
            globalEmotes
        ];

        settings.add({
            id: 'bttvEmotes',
            name: 'BetterTTV Emotes',
            defaultValue: true,
            description: 'BetterTTV adds extra cool emotes for you to use.'
        });
        settings.add({
            id: 'bttvGIFEmotes',
            name: 'BetterTTV GIF Emotes',
            defaultValue: false,
            description: 'We realize not everyone likes GIFs, but some people do.'
        });
    }

    getEligibleEmote(user, code) {
        const channel = twitch.getCurrentChannel();

        for (let i = 0; i < this.emoteProviders.length; i++) {
            const provider = this.emoteProviders[i];
            const emote = provider.getEligibleEmote(code);
            if (!emote || !emote.isUsable(channel, user)) continue;
            if (emote.imageType === 'gif' && settings.get('bttvGIFEmotes') === false) continue;
            if (emote.provider.id.startsWith('bttv') && settings.get('bttvEmotes') === false) continue;
            return emote;
        }

        return null;
    }
}

module.exports = new EmotesModule();
