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
        watcher.on('load.directory.following', () => this.load());
    }

    load() {
        if (settings.get('showDirectoryLiveTab') === false) return;
        $('a[href="/directory/following/live"]')[0].click();
    }
}

module.exports = new DirectoryLiveFollowingModule();
