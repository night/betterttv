const $ = require('jquery');
const settings = require('../../settings');

const AbstractEmotes = require('../emotes/abstract-emotes');
const Emote = require('../emotes/emote');

const provider = {
    id: 'gw-global',
    displayName: 'GameWisp Global Emotes',
    badge: 'https://d32y8axfzs6sv8.cloudfront.net/static/gamewisp_transparent_18px.png'
};

const GLOBAL_EMOTES_ENDPOINT = 'https://api.gamewisp.com/pub/v1/emote/global';

class GWGlobalEmotes extends AbstractEmotes {
    constructor() {
        super();

        settings.add({
            id: 'gwEmotes',
            name: 'GameWisp Emotes',
            defaultValue: false,
            description: 'Use GameWisp emotes'
        });

        this.updateGlobalEmotes();

        settings.on('changed.gwEmotes', () => {
            this.updateGlobalEmotes();
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
        if (settings.get('gwEmotes') !== true) return;

        $.getJSON(GLOBAL_EMOTES_ENDPOINT).done(({data}) => {
            data.forEach(({shortcode, id, image_asset: {data: {content}}}) => {
                this.emotes.set(shortcode, new Emote({
                    id,
                    channel: {name: 'GameWisp'},
                    code: shortcode,
                    images: {
                        '1x': content.small,
                        '2x': content.medium,
                        '4x': content.large
                    },
                    imgType: 'png',
                    provider: this.provider
                }));
            });
        });
    }
}

module.exports = new GWGlobalEmotes();
