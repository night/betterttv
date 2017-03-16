const $ = require('jquery');
const settings = require('../../settings');

const AbstractEmotes = require('../emotes/abstract-emotes');
const Emote = require('../emotes/emote');

const provider = {
    id: 'gw-global',
    displayName: 'GameWisp Global Emotes',
    badge: 'https://d32y8axfzs6sv8.cloudfront.net/static/gamewisp_transparent_18px.png'
};

class GWGlobalEmotes extends AbstractEmotes {
    constructor() {
        super();

        settings.add({
            id: 'gwEmotes',
            name: 'GameWisp Emotes',
            defaultValue: false,
            description: 'Use GameWisp emotes'
        });

        if (settings.get('gwEmotes')) {
            this.updateGlobalEmotes();
        }

        settings.on('changed.gwEmotes', () => {
            if (settings.get('gwEmotes') && !this.emotes.size) {
                this.updateGlobalEmotes();
            }
        });
    }

    get provider() {
        return provider;
    }

    getEmotes() {
        if (!settings.get('gwEmotes')) return [];

        return [...this.emotes.values()];
    }

    updateGlobalEmotes() {
        $.getJSON('https://api.gamewisp.com/pub/v1/emote/global').done(emotes => {
            emotes.data.forEach(emote => {
                this.emotes.set(emote.shortcode, new Emote({
                    id: emote.id,
                    provider: this.provider,
                    channel: {name: 'GameWisp'},
                    code: emote.shortcode,
                    images: {
                        '1x': emote.image_asset.data.content.small,
                        '2x': emote.image_asset.data.content.medium,
                        '4x': emote.image_asset.data.content.large
                    },
                    imgType: 'png'
                }));
            });
        });
    }
}

module.exports = new GWGlobalEmotes();
