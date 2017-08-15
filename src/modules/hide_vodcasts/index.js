const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

const VODCAST_SELECTOR = '.js-streams .pill.is-watch-party';
const CARD_SELECTOR = '.card';

class HideVodcastsModule {
    constructor() {
        settings.add({
            id: 'hideVodcasts',
            name: 'Hide Vodcasts',
            defaultValue: false,
            description: 'Hide Vodcasts from directory listings'
        });
        settings.on('changed.hideVodcasts', value => value === true ? this.hide() : this.show());

        watcher.on('directory.changed', () => this.hide());

        watcher.on('load.communities.community', () => this.delayedHide());
        watcher.on('load.directory.channels.all', () => this.delayedHide());
        watcher.on('load.directory.following.channels', () => this.delayedHide());
        watcher.on('load.directory.game', () => this.delayedHide());
        watcher.on('load.following.overview', () => this.delayedHide());
    }

    delayedHide() {
        // timeout used because events sometimes fire before elements are created
        setTimeout(() => {
            this.hide();
        }, 200);
    }

    hide() {
        if (settings.get('hideVodcasts') === false) return;
        $(VODCAST_SELECTOR).closest(CARD_SELECTOR).parent(':visible').hide();
    }

    show() {
        $(VODCAST_SELECTOR).closest(CARD_SELECTOR).parent(':hidden').show();
    }
}

module.exports = new HideVodcastsModule();
