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
            defaultValue: true,
            description: 'Hides the Recommended Friends section so you have more room for activities!'
        });
        settings.add({
            id: 'hideOfflineFollowedChannels',
            name: 'Hide Offline Followed Channels',
            defaultValue: false,
            description: 'Hides all offline followed channels for those who follow a ton of channels'
        });
        settings.add({
            id: 'hidePrimePromotion',
            name: 'Hide Prime Promotions',
            defaultValue: false,
            description: 'Hides the "Free With Prime" section of the sidebar'
        });
        settings.on('changed.hideFeaturedChannels', () => this.toggleFeaturedChannels());
        settings.on('changed.autoExpandChannels', () => this.toggleAutoExpandChannels());
        settings.on('changed.hideRecommendedFriends', () => this.toggleRecommendedFriends());
        settings.on('changed.hideOfflineFollowedChannels', () => this.toggleOfflineFollowedChannels());
        settings.on('changed.hidePrimePromotion', () => this.togglePrimePromotions());
        watcher.on('load', () => {
            this.toggleFeaturedChannels();
            this.toggleAutoExpandChannels();
            this.toggleRecommendedFriends();
            this.toggleOfflineFollowedChannels();
            this.togglePrimePromotions();
        });
    }

    toggleFeaturedChannels() {
        $('body').toggleClass('bttv-hide-featured-channels', settings.get('hideFeaturedChannels'));
    }

    toggleAutoExpandChannels() {
        if (settings.get('autoExpandChannels') === true) {
            $('.side-nav-load-more__button').trigger('click');
        }
    }

    toggleRecommendedFriends() {
        $('body').toggleClass('bttv-hide-recommended-friends', settings.get('hideRecommendedFriends'));
    }

    toggleOfflineFollowedChannels() {
        var resizeTimer = null;
        function hideOfflineUser() {
            if (settings.get('hideOfflineFollowedChannels') === true) {
                $('.side-nav-card__avatar--offline').parent().css('cssText', 'display: none!important');
            }
        };
        $(window).bind('resize', function() {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(hideOfflineUser, 100);
        });
    }

    togglePrimePromotions() {
        $('body').toggleClass('bttv-hide-prime-promotions', settings.get('hidePrimePromotion'));
    }
}

module.exports = new HideSidebarElementsModule();
