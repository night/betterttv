const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

class ColoredOfflineChannelsModule {
    constructor() {
        settings.add({
            id: 'coloredOfflineChannels',
            name: 'Colored Offline Channels',
            defaultValue: true,
            description: 'All offline channels will now have colored icons'
        });
        settings.on('changed.coloredOfflineChannels', () => this.toggleColoredOffline());
        watcher.on('load', () => {
            this.toggleColoredOffline();
            this.channelListObserver();
        });
    }

    toggleColoredOffline() {
        if (settings.get('coloredOfflineChannels')) {
            $('.side-nav-card__avatar').toggleClass('side-nav-card__avatar--offline', false);
        } else {
            $('.side-nav-card__avatar').each( (ind, el) => {
                const status = $(el).parent().find('.side-nav-card__metadata div span').text();
                if (status === 'Offline') {
                    $(el).toggleClass('side-nav-card__avatar--offline', true);
                }
            });
        }
    }

    channelListObserver() {
        const chatList = $('.tw-link--button[data-a-target="side-nav-show-more-button"]').parent().parent()[0];
        const channelListWatcher = new window.MutationObserver(mutations =>
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    this.toggleColoredOffline();
                }
            })
        );
        channelListWatcher.observe(chatList, {childList: true});
    }
}

module.exports = new ColoredOfflineChannelsModule();
