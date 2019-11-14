const $ = require('jquery');
const settings = require('../../settings');

class HideChannelPointsModule {
    constructor() {
        settings.add({
            id: 'hideChannelPoints',
            name: 'Hide Channel Points',
            defaultValue: false,
            description: 'Hides channel points from the chat UI to reduce clutter'
        });
        settings.on('changed.hideChannelPoints', () => this.load());
        this.load();
    }

    load() {
        $('body').toggleClass('bttv-hide-channel-points', settings.get('hideChannelPoints'));
    }
}

module.exports = new HideChannelPointsModule();
