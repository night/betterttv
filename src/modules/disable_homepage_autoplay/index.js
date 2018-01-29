const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

class DisableHomepageAutoplayModule {
    constructor() {
        settings.add({
            id: 'disableFPVideo',
            name: 'Disable Homepage Autoplay',
            defaultValue: false,
            description: 'Disables video player autoplay on the homepage'
        });
        watcher.on('load.homepage', () => this.load());
    }

    load() {
        if (settings.get('disableFPVideo') === false) return;
        const currentPlayer = twitch.getCurrentPlayer();
        if (!currentPlayer) return;

        let startedPlaying = false;
        let loops = 0;
        const interval = setInterval(() => {
            loops++;
            if (loops > 300) {
                clearInterval(interval);
                return;
            }

            if (!currentPlayer.player) return;

            const paused = currentPlayer.player.isPaused();
            const channel = currentPlayer.player.getChannel();
            if (paused && channel && startedPlaying) {
                clearInterval(interval);
                return;
            }

            startedPlaying = true;
            try {
                currentPlayer.player.pause();
            } catch (e) {}
        }, 100);
    }
}

module.exports = new DisableHomepageAutoplayModule();
