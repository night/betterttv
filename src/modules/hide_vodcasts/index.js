const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

const VODCAST_SELECTOR = '.live-channel-card .tw-pill';
const CARD_CONTAINER = '.mg-b-2';

class HideVodcastsModule {
    constructor() {
        settings.add({
            id: 'hideVodcasts',
            name: 'Hide Vodcasts',
            defaultValue: false,
            description: 'Hide Vodcasts from directory listings'
        });
        settings.on('changed.hideVodcasts', value => value === true ? this.hide(undefined) : this.show());

        watcher.on('directory.vodcast', vodCast => this.hide(vodCast));
    }

    hide(vodCast) {
        if (settings.get('hideVodcasts') === false) return;
        if (vodCast === undefined) {
            $(VODCAST_SELECTOR).closest(CARD_CONTAINER).hide();
        } else {
            $(vodCast).closest(CARD_CONTAINER).hide();
        }
    }

    show() {
        $(VODCAST_SELECTOR).closest(CARD_CONTAINER).show();
    }
}

module.exports = new HideVodcastsModule();
