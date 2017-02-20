const settings = require('../../settings');
const watcher = require('../../watcher');

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
        // Using our own jQuery breaks this. Ember must not be getting events from our instance.
        try {
            jQuery('a[href="/directory/following/live"]').click();
        } catch (e) {}
    }
}

module.exports = new DirectoryLiveFollowingModule();
