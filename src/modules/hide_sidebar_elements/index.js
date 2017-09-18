const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');

class HideSidebarElementsModule {
    constructor() {
        settings.add({
            id: 'hideFeaturedChannels',
            name: 'Hide Recommended Channels',
            defaultValue: true,
            description: 'The left sidebar is too cluttered, so you can remove recommended channels'
        });
        settings.add({
            id: 'hidePrimePromotion',
            name: 'Hide Prime Promotions',
            defaultValue: false,
            description: 'Hides the "Free With Prime" section of the sidebar'
        });
        settings.on('changed.hideFeaturedChannels', () => this.toggleFeaturedChannels());
        settings.on('changed.hidePrimePromotion', () => this.togglePrimePromotions());
        watcher.on('load', () => {
            this.toggleFeaturedChannels();
            this.togglePrimePromotions();
        });
    }

    toggleFeaturedChannels() {
        $('body').toggleClass('bttv-hide-featured-channels', settings.get('hideFeaturedChannels'));
    }

    togglePrimePromotions() {
        $('body').toggleClass('bttv-hide-prime-promotions', settings.get('hidePrimePromotion'));
    }
}

module.exports = new HideSidebarElementsModule();
