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
                currentPlayer.pause();
            }, 0);
            if (currentPlayer.emitter) {
                currentPlayer.emitter.removeListener('Playing', stopAutoplay);
            } else {
                currentPlayer.removeEventListener('play', stopAutoplay);
            }
        };

        if (currentPlayer.emitter) {
            currentPlayer.pause();
            currentPlayer.emitter.on('Playing', stopAutoplay);
        } else {
            currentPlayer.addEventListener('play', stopAutoplay);
        }
    }
}

module.exports = new DisableHomepageAutoplayModule();
