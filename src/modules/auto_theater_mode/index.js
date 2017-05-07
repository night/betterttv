const debug = require('../../utils/debug');
const settings = require('../../settings');
const watcher = require('../../watcher');
const storage = require('../../storage');

let tempToggledDarkMode = false;


class AutoTheaterModeModule {
    constructor() {
        settings.add({
            id: 'autoTheatreMode',
            name: 'Automatic Theatre Mode',
            defaultValue: false,
            description: 'Automatically enables theatre mode'
        });
        watcher.on('load.channel', () => this.load());
        watcher.on('load.vod', () => this.load());
    }

    load() {
        this.attachTheatreListener();

        if (settings.get('autoTheatreMode') === false) return;

        try {
            if (App.__container__.lookup('service:persistentPlayer').playerComponent.player.theatre) return;
            window.Mousetrap.trigger('alt+t');
        } catch (e) {
            debug.log('Error toggling theater mode: ', e);
        }
    }

    attachTheatreListener() {
        const playerService = App.__container__.lookup('service:persistentPlayer');
        if (!playerService || !playerService.playerComponent || !playerService.playerComponent.player) return;
        playerService.playerComponent.player.addEventListener('theatrechange', state => {
            if (settings.get('darkenedMode') === true && !tempToggledDarkMode) return;
            tempToggledDarkMode = !tempToggledDarkMode;
            settings.set('darkenedMode', state);
            // Turn darkenedMode setting off again if needed but without emit
            if (state) storage.set('darkenedMode', false, undefined, false, false);
        });
    }
}

module.exports = new AutoTheaterModeModule();
