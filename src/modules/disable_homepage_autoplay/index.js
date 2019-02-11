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

        const stopAutoplay = () => {
            setTimeout(() => {
                currentPlayer.player.pause();
            }, 0);
            currentPlayer.player.removeEventListener('play', stopAutoplay);
        };

        currentPlayer.player.addEventListener('play', stopAutoplay);
    }
}

module.exports = new DisableHomepageAutoplayModule();
