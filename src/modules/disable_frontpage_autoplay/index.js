const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

class DisableFrontpageAutoplayModule {
    constructor() {
        settings.add({
            id: 'disableFPVideo',
            name: 'Disable Frontpage Autoplay',
            defaultValue: false,
            description: 'Disable autoplay on the frontpage video player'
        });

        watcher.on('load', () => this.load());
    }

    load() {
        if (settings.get('disableFPVideo') === false || window.location.pathname !== '/') return;

        const $player = $('#player');
        const id = $player.parent().attr('id');
        if (!id) return;

        const view = twitch.getEmberView(id);
        if (!view) return;

        let startedPlaying = false;
        const interval = setInterval(() => {
            const paused = view.player.isPaused();
            const channel = view.player.getChannel();
            const quality = view.player.getQuality();
            if (paused && channel && startedPlaying) {
                clearInterval(interval);
                return;
            }

            if (!quality) return;
            startedPlaying = true;
            try {
                view.player.pause();
            } catch (e) {}
        }, 100);
    }
}

module.exports = new DisableFrontpageAutoplayModule();
