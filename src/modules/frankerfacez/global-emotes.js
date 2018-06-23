const api = require('../../utils/api');
const watcher = require('../../watcher');
const settings = require('../../settings');

const AbstractEmotes = require('../emotes/abstract-emotes');
const Emote = require('../emotes/emote');

const provider = {
    id: 'ffz-global',
    displayName: 'FrankerFaceZ Global Emotes'
};

class GlobalEmotes extends AbstractEmotes {
    constructor() {
        super();

        settings.add({
            id: 'ffzEmotes',
            name: 'FrankerFaceZ Emotes',
            defaultValue: true,
            description: 'Emotes from that other extension people sometimes use.'
        });

        settings.on('changed.ffzEmotes', () => this.updateGlobalEmotes());

        this.updateGlobalEmotes();
    }

    get provider() {
        return provider;
    }

    updateGlobalEmotes() {
        this.emotes.clear();

        if (!settings.get('ffzEmotes')) return;

        api
            .get('frankerfacez_emotes/global')
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

module.exports = new GlobalEmotes();
