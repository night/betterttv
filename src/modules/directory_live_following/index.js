import settings from '../../settings.js';
import watcher from '../../watcher.js';
import $ from 'jquery';

class DirectoryLiveFollowingModule {
    constructor() {
        settings.add({
            id: 'showDirectoryLiveTab',
            name: 'Default to Live Channels',
            defaultValue: false,
            description: 'Defaults to "Live" tab on the Following page'
        });
        watcher.on('load.directory.following', () => this.load());
    }

    load(retries = 0) {
        if (settings.get('showDirectoryLiveTab') === false || retries > 10) return;
        const button = $('a[href="/directory/following/live"]');
        if (!button.length) {
            return setTimeout(() => this.load(retries + 1), 250);
        }
        button[0].click();
    }
}

export default new DirectoryLiveFollowingModule();
