const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

class DisableHostModeModule {
    constructor() {
        settings.add({
            id: 'disableHostMode',
            name: 'Disable Host Mode',
            defaultValue: false,
            description: 'Disables hosted channels on Twitch'
        });
        settings.on('changed.disableHostMode', () => this.disableHostMode());
        watcher.on('load.channel', () => this.observeHostMode());
    }

    disableHostMode() {
        if (!settings.get('disableHostMode')) return;

        const channelContainer = twitch.getEmberContainer('controller:channel');
        if (!channelContainer) return;
        channelContainer.set('channelModel.hostModeTarget', null);
    }

    observeHostMode() {
        const channelContainer = twitch.getEmberContainer('controller:channel');
        if (!channelContainer) return;
        channelContainer.addObserver('channelModel.hostModeTarget', () => this.disableHostMode());
        this.disableHostMode();
    }
}

module.exports = new DisableHostModeModule();
