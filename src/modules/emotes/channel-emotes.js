const watcher = require('../../watcher');
const mustacheFormat = require('../../utils/regex').mustacheFormat;
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

    updateChannelEmotes({channelEmotes, sharedEmotes}) {
        this.emotes.clear();

        channelEmotes.forEach(({id, code, imageType}) => (
            this.emotes.set(code, new Emote({
                id,
                provider: this.provider,
                channel: {name: undefined},
                code,
                images: {
                    '1x': mustacheFormat(cdn.urlTemplate, {id, image: '1x'}),
                    '2x': mustacheFormat(cdn.urlTemplate, {id, image: '2x'}),
                    '4x': mustacheFormat(cdn.urlTemplate, {id, image: '3x'})
                },
                imageType
            }))
        ));
        sharedEmotes.forEach(({id, code, imageType, user: {name}}) => (
            this.emotes.set(code, new Emote({
                id,
                provider: this.provider,
                channel: {name},
                code,
                images: {
                    '1x': mustacheFormat(cdn.urlTemplate, {id, image: '1x'}),
                    '2x': mustacheFormat(cdn.urlTemplate, {id, image: '2x'}),
                    '4x': mustacheFormat(cdn.urlTemplate, {id, image: '3x'})
                },
                imageType
            }))
        ));

        setTimeout(() => watcher.emit('emotes.updated'), 0);
    }
}

module.exports = new ChannelEmotes();
