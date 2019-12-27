const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class HideCommunityGiftChestModule {
    constructor() {
        settings.add({
            id: 'hideCommunityGiftChest',
            name: 'Hide Community Gift Chest',
            defaultValue: false,
            description: 'Hide the Community Gift Chest toast that appears over Twitch chat.'
        });

        settings.on('changed.hideCommunityGiftChest', this.toggleCommunityGiftChest);
        watcher.on('load', this.toggleCommunityGiftChest);
    }

    toggleCommunityGiftChest() {
        $('body').toggleClass(
            'bttv-hide-community-gift-chest',
            settings.get('hideCommunityGiftChest')
        );
    }
}

module.exports = new HideCommunityGiftChestModule();
