const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');

class AutoTheaterModeModule {
    constructor() {
        settings.add({
            id: 'autoTheatreMode',
            name: 'Automatic Theatre Mode',
            defaultValue: false,
            description: 'Automatically enables theatre mode'
        });
        watcher.on('load.channel', () => this.load());
        watcher.on('load.vod', () => this.load());
    }

    load() {
        if (settings.get('autoTheatreMode') === false) return;

        try {
            const container = App.__container__;
            const routeName = container.lookup('controller:application').get('currentRouteName');
            if (routeName !== 'channel.index.index' && ['videos', 'vod'].includes(routeName)) return;
            if (container.lookup('service:persistentPlayer').playerComponent.player.theatre) return;

            window.Mousetrap.trigger('alt+t');
        } catch (e) {
            debug.log('Error toggling theater mode: ', e);
        }
    }
}

module.exports = new AutoTheaterModeModule();
