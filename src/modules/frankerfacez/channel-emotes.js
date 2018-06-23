const watcher = require('../../watcher');
const api = require('../../utils/api');
const twitch = require('../../utils/twitch');
const settings = require('../../settings');

const AbstractEmotes = require('../emotes/abstract-emotes');
const Emote = require('../emotes/emote');

const provider = {
    id: 'ffz-channel',
    displayName: 'FrankerFaceZ Channel Emotes'
};

class FrankerFaceZChannelEmotes extends AbstractEmotes {
    constructor() {
        super();

        watcher.on('channel.updated', () => this.updateChannelEmotes());
    }

    get provider() {
        return provider;
    }

    updateChannelEmotes() {
        this.emotes.clear();

        if (!settings.get('ffzEmotes')) return;

        const currentChannel = twitch.getCurrentChannel();
        if (!currentChannel) return;

        api
            .get(`frankerfacez_emotes/channels/${currentChannel.id}`)
            .then(({emotes}) =>
                emotes.forEach(({id, channel, code, images, imageType}) => {
                    this.emotes.set(code, new Emote({
                        id,
                        provider: this.provider,
                        channel,
                        code,
                        images,
                        imageType
                    }));
                })
            )
            .then(() => watcher.emit('emotes.updated'));
    }
}

module.exports = new FrankerFaceZChannelEmotes();
