const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let oldGetHostedChannelLogin;
function newGetHostedChannelLogin() {
    if (settings.get('disableHostMode')) return null;
    oldGetHostedChannelLogin.call(this, ...arguments);
}

let oldHandleHostingChange;
function newHandleHostingChange(e) {
    if (e !== null && settings.get('disableHostMode')) return null;
    oldHandleHostingChange.call(this, ...arguments);
}

class DisableHostModeModule {
    constructor() {
        settings.add({
            id: 'disableHostMode',
            name: 'Disable Host Mode',
            defaultValue: false,
            description: 'Disables hosted channels on Twitch'
        });
        settings.on('changed.disableHostMode', () => this.load());
        watcher.on('load.chat', () => this.load());
    }

    load() {
        const channelController = twitch.getChannelController();
        if (!channelController) return;

        if (channelController.getHostedChannelLogin !== newGetHostedChannelLogin) {
            oldGetHostedChannelLogin = channelController.getHostedChannelLogin;
            channelController.getHostedChannelLogin = newGetHostedChannelLogin;
        }

        if (channelController.handleHostingChange !== newHandleHostingChange) {
            oldHandleHostingChange = channelController.handleHostingChange;
            channelController.handleHostingChange = newHandleHostingChange;
        }

        if (!settings.get('disableHostMode')) return;

        channelController.handleHostingChange(null);
    }
}

module.exports = new DisableHostModeModule();
