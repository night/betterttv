const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');

const EXTENSION_CONTAINER = '#js-player-extension-root';

class HideExtensionsModule {
    constructor() {
        settings.add({
            id: 'hideExtensions',
            name: 'Hide Extensions',
            defaultValue: false,
            description: 'Hides Twitch extensions that are displayed over the video player'
        });
        watcher.on('load.player', () => this.load());
    }

    load() {
        if (settings.get('hideExtensions') === false) return;
        $(EXTENSION_CONTAINER).hide();
    }
}

module.exports = new HideExtensionsModule();
