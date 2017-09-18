const api = require('../../utils/api');
const mustacheFormat = require('../../utils/regex').mustacheFormat;
const cdn = require('../../utils/cdn');
const legacySubscribers = require('../legacy_subscribers');
const watcher = require('../../watcher');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');

const provider = {
    id: 'bttv',
    displayName: 'BetterTTV Global Emotes',
    badge: cdn.url('tags/developer.png')
};

class GlobalEmotes extends AbstractEmotes {
    constructor() {
        super();

        this.updateGlobalEmotes();
    }

    get provider() {
        return provider;
    }

    updateGlobalEmotes() {
        api
            .get('emotes')
            .then(({urlTemplate, emotes}) =>
                emotes.forEach(({id, channel, code, imageType, restrictions}) => {
                    let restrictionCallback;
                    if (restrictions && restrictions.emoticonSet) {
                        restrictionCallback = (_, user) => {
                            if (restrictions.emoticonSet !== 'night') return false;
                            return user ? legacySubscribers.hasSubscription(user.name) : false;
                        };
                    }

                    this.emotes.set(code, new Emote({
                        id,
                        provider: this.provider,
                        channel: channel ? {name: channel} : undefined,
                        code,
                        images: {
                            '1x': mustacheFormat(urlTemplate, {id, image: '1x'}),
                            '2x': mustacheFormat(urlTemplate, {id, image: '2x'}),
                            '4x': mustacheFormat(urlTemplate, {id, image: '3x'})
                        },
                        imageType,
                        restrictionCallback
                    }));
                })
            )
            .then(() => watcher.emit('emotes.updated'));
    }
}

module.exports = new GlobalEmotes();
