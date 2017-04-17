const watcher = require('../../watcher');
const mustacheFormat = require('../../utils/regex').mustacheFormat;
const twitch = require('../../utils/twitch');
const cdn = require('../../utils/cdn');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');

const provider = {
    id: 'bttv-channel',
    displayName: 'BetterTTV Channel Emotes',
    badge: cdn.url('tags/developer.png')
};

class ChannelEmotes extends AbstractEmotes {
    constructor() {
        super();

        watcher.on('channel.updated', d => this.updateChannelEmotes(d));
    }

    get provider() {
        return provider;
    }

    updateChannelEmotes({urlTemplate, emotes}) {
        this.emotes.clear();

        const channel = twitch.getCurrentChannel();
        if (!channel) return;

        emotes.forEach(({id, code, imageType}) => (
            this.emotes.set(code, new Emote({
                id,
                provider: this.provider,
                channel,
                code,
                images: {
                    '1x': mustacheFormat(urlTemplate, {id, image: '1x'}),
                    '2x': mustacheFormat(urlTemplate, {id, image: '2x'}),
                    '4x': mustacheFormat(urlTemplate, {id, image: '3x'})
                },
                imageType
            }))
        ));
    }
}

module.exports = new ChannelEmotes();
