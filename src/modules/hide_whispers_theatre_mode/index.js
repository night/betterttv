const settings = require('../../settings');
const $ = require('jquery');

class HideWhispersTheatreModeModule {
    constructor() {
        settings.add({
            id: 'hideWhispersTheatreMode',
            name: 'Hide whispers in Theatre Mode',
            defaultValue: false,
            description: 'Whisper panel takes an extra video player height.'
        });
        settings.on('changed.hideWhispersTheatreMode', () => this.toggle());
        this.load();
    }

    toggle() {
        $('body').toggleClass('bttv-hide-theatre-whispers-panel', settings.get('hideWhispersTheatreMode'));
    }
}

module.exports = new HideWhispersTheatreModeModule();
