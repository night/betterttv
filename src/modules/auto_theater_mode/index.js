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
        settings.add({
            id: 'offlineTheatreMode',
            name: 'Offline Theatre Mode',
            defaultValue: false,
            description: 'Disables automatic theatre mode if the channel is offline'
        });
        watcher.on('load.player', () => this.load());
    }

    load() {
        if (settings.get('autoTheatreMode') === false) return;

        const player = twitch.getCurrentPlayer();
        if (!player) return;

        const isLive = !!player.player.ended;
        if (settings.get('offlineTheatreMode') === true && isLive === false) return;

        player.player.setTheatre(true);
    }
}

module.exports = new AutoTheaterModeModule();
