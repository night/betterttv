const settings = require('../../settings');
const watcher = require('../../watcher');
const $ = require('jquery');

class DirectoryLiveFollowingModule {
    constructor() {
        settings.add({
            id: 'showDirectoryLiveTab',
            name: 'Default to Live Channels',
            defaultValue: false,
            description: 'BetterTTV can click on "Channels" for you in the Following Overview automatically'
        });
        settings.add({
            id: 'autoExpandChannels',
            name: 'Auto Expand Followed Live Channels List',
            defaultValue: false,
            description: 'Automatically clicks the "Load More" option for you'
        });

        watcher.on('load.directory.following', () => this.load());
        watcher.on('load', () => this.toggleAutoExpandChannels());
    }

    load() {
        if (settings.get('showDirectoryLiveTab') === false) return;
        $('a[href="/directory/following/live"]')[0].click();
    }

    toggleAutoExpandChannels() {
        if (!window.location.href.includes('directory/following/live')) return;
        if (!settings.get('autoExpandChannels')) return;

        $('.following__view-all').click();
        const expandInterval = setInterval(() => {
            $('.following__view-all').click();
        }, 100);

        setTimeout(() => {
            clearInterval(expandInterval);
        }, 3000);
    }
}

module.exports = new DirectoryLiveFollowingModule();
