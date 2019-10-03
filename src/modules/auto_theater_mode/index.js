const $ = require('jquery');
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

        try {
            player.setTheatre(true);
        } catch (_) {
            if ($('.highwind-video-player--theatre').length === 0) {
                $('button[data-a-target="player-theatre-mode-button"]').click();
            }
        }
    }
}

module.exports = new AutoTheaterModeModule();
