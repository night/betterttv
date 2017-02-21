const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

class DisableHostModeModule {
    constructor() {
        settings.add({
            id: 'showFeaturedChannels',
            name: 'Hide Recommended Channels',
            defaultValue: true,
            description: 'The left sidebar is too cluttered, so you can remove recommended channels'
        });
        settings.on('changed.showFeaturedChannels', () => this.toggleFeaturedChannels());
        watcher.on('load', () => this.toggleFeaturedChannels());
    }

    toggleFeaturedChannels() {
        if (settings.get('showFeaturedChannels') === false) {
            $('.js-recommended-channels').show();
        } else {
            $('.js-recommended-channels').hide();
        }
    }
}

module.exports = new DisableHostModeModule();
