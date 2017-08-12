const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class HideVodcastsModule {
    constructor() {
        settings.add({
            id: 'hideVodcasts',
            name: 'Hide Vodcasts',
            defaultValue: false,
            description: 'Hide Vodcasts in your following list'
        });
        settings.on('changed.hideVodcasts', value => value === true ? this.load() : this.unload());
        watcher.on('load.following', () => this.load());
    }

    load() {
        if (settings.get('hideVodcasts') === false) return;
        $('.qa-stream-preview .is-watch-party').closest('.qa-stream-preview:visible').hide(); // hide vodcasts on page load
        this.registerMutationObserver();
    }

    unload() {
        if ( this.observer ) {
            this.observer.disconnect();
            $('.qa-stream-preview .is-watch-party').closest('.qa-stream-preview:hidden').show();
        }
    }

    registerMutationObserver() {
        let target = document.querySelector('.js-streams .infinite-scroll.tower'); // Overview tab (twitch.tv/directory/following/live)
        if ( !target ) target = document.querySelector('.js-streams.qa-live-streams'); // Channels tab (twitch.tv/directory/following)
        if ( target ) {
            // hides vodcasts when infinite scrolling
            this.observer = new MutationObserver(() => {
                $('.qa-stream-preview .is-watch-party').closest('.qa-stream-preview:visible').hide();
            });
            const config = {
                childList: true
            };
            this.observer.observe(target, config);
        }
    }
}

module.exports = new HideVodcastsModule();
