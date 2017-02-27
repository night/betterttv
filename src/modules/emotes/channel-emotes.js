const watcher = require('../../watcher');
const api = require('../../utils/api');
const mustacheFormat = require('../../utils/regex').mustacheFormat;
const twitch = require('../../utils/twitch');
const cdn = require('../../utils/cdn');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');

let channel = {};
const provider = {
    id: 'bttv-channel',
    displayName: 'BetterTTV Channel Emotes',
    badge: cdn.url('tags/developer.png')
};

class ChannelEmotes extends AbstractEmotes {
    constructor() {
        super();

        watcher.on('load.channel', () => {
            const currentChannel = twitch.getCurrentChannel();
            if (currentChannel.id !== channel.id) {
                channel = currentChannel;
                this.updateChannelEmotes();
            }
        });
    }

    get provider() {
        return provider;
    }

    updateChannelEmotes() {
        this.emotes.clear();

        api
        .get(`channels/${channel.name}`)
        .then(({urlTemplate, emotes}) => emotes.forEach(({id, code, imageType}) => {
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
            }));
        }));
    }
}

module.exports = new ChannelEmotes();
