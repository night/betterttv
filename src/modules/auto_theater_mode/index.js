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
            description: 'Enables theatre mode by default'
        });
        watcher.on('load.player', () => this.load());
    }

    load() {
        if (settings.get('autoTheatreMode') === false) return;

        const player = twitch.getCurrentPlayer();
        if (!player) return;

        // new Twitch channel layout does funky stuff with the video player in the background when on home screen
        if ($('div[data-a-player-type="channel_home_live"]').length > 0 || $('.video-player__container--theatre').length > 0) return;

        try {
            player.setTheatre(true);
        } catch (_) {
            $('button[data-a-target="player-theatre-mode-button"]').click();
        }

        // hackfix: twitch's channel page experiment causes the player to load multiple times
        setTimeout(() => this.load(), 1000);
    }
}

module.exports = new AutoTheaterModeModule();
