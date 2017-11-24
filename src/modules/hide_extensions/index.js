const $ = require('JQuery');
const settings = require('../../settings');
const watcher = require('../../watcher');

class HideExtensionsModule {
    constructor() {
        settings.add({
            id: 'hideExtensions',
            name: 'Hide Extensions',
            defaultValue: false,
            description: 'Hide Twitch Extensions'
        });
        watcher.on('load.player', () => this.load());
    }

    load() {
        if (settings.get('hideExtensions') === false) return;
        $('#js-player-extension-root').hide();
    }
}

module.exports = new HideExtensionsModule();
