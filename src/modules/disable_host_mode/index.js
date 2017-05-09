const settings = require('../../settings');

class DisableHostModeModule {
    constructor() {
        settings.add({
            id: 'disableHostMode',
            name: 'Disable Host Mode',
            defaultValue: false,
            description: 'Disables hosted channels on Twitch'
        });
        settings.on('changed.disableHostMode', () => this.load());
        this.load();
    }

    load() {
        try {
            window.App.__container__.lookup('service:globals').set('enableHostMode', !settings.get('disableHostMode'));
        } catch (e) {}
    }
}

module.exports = new DisableHostModeModule();
