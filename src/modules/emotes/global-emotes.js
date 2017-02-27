const api = require('../../utils/api');
const mustacheFormat = require('../../utils/regex').mustacheFormat;

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');

const provider = {
    id: 'bttv',
    displayName: 'BetterTTV Global Emotes'
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
                    restrictionCallback = () => false;
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
        );
    }
}

module.exports = new GlobalEmotes();
