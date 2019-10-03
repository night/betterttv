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
            id: 'autoExpandChannels',
            name: 'Auto Expand Followed Channels List',
            defaultValue: false,
            description: 'Automatically clicks the "Load More" option for you'
        });
        settings.add({
            id: 'hideRecommendedFriends',
            name: 'Hide Recommended Friends',
            defaultValue: false,
            description: 'Hides the Recommended Friends section so you have more room for activities!'
        });
        settings.add({
            id: 'hideOfflineFollowedChannels',
            name: 'Hide Offline Followed Channels',
            defaultValue: false,
            description: 'Hides all offline followed channels for those who follow a ton of channels'
        });
        settings.on('changed.hideFeaturedChannels', () => this.toggleFeaturedChannels());
        settings.on('changed.autoExpandChannels', () => this.toggleAutoExpandChannels());
        settings.on('changed.hideRecommendedFriends', () => this.toggleRecommendedFriends());
        settings.on('changed.hideOfflineFollowedChannels', () => this.toggleOfflineFollowedChannels());
        watcher.on('load', () => {
            this.toggleFeaturedChannels();
            this.toggleAutoExpandChannels();
            this.toggleRecommendedFriends();
            this.toggleOfflineFollowedChannels();
            this.togglePrimePromotions();
            this.toggleOpenOfflineChannels();
        });
    }

    toggleFeaturedChannels() {
        $('body').toggleClass('bttv-hide-featured-channels', settings.get('hideFeaturedChannels'));
    }

    toggleAutoExpandChannels() {
        if (!settings.get('autoExpandChannels')) return;
        $('.side-nav button[data-a-target="side-nav-show-more-button"]').first().trigger('click');
    }

    toggleRecommendedFriends() {
        $('body').toggleClass('bttv-hide-recommended-friends', settings.get('hideRecommendedFriends'));
    }

    toggleOfflineFollowedChannels() {
        $('body').toggleClass('bttv-hide-followed-offline', settings.get('hideOfflineFollowedChannels'));
    }

    togglePrimePromotions() {
        $('body').toggleClass('bttv-hide-prime-promotions', settings.get('hidePrimePromotion'));
    }

    toggleOpenOfflineChannels() {
        $('body').on('click', '[data-a-target="followed-channel"]', function(e) {
            const $card = $(this).find('.side-nav-card__title');
            const channel = $card.attr('title');

            if (typeof channel !== 'undefined') {
                e.preventDefault();
                location.href = `/${channel}`;
            }
        });
    }
}

module.exports = new HideSidebarElementsModule();
