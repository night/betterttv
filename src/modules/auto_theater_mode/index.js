const twitch = require('../../utils/twitch');
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
        watcher.on('load.player', () => this.load());
    }

    load() {
        if (settings.get('autoTheatreMode') === false) return;

        const player = twitch.getCurrentPlayer();
        if (!player) return;

        player.player.setTheatre(true);
    }
}

module.exports = new AutoTheaterModeModule();
