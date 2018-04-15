const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let oldHostingHandler;
function newHostingHandler() {
    if (settings.get('disableHostMode')) return;
    oldHostingHandler.call(this, ...arguments);
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
        const chatController = twitch.getChatController();
        if (!chatController || !chatController.hostingHandler) return;
        if (!chatController.props || !chatController.props.onHostingChange) return;

        if (chatController.hostingHandler !== newHostingHandler) {
            oldHostingHandler = chatController.hostingHandler;
            chatController.hostingHandler = newHostingHandler;
        }

        if (!settings.get('disableHostMode')) return;

        chatController.setState({
            hostedChannelLogin: null
        });
        chatController.props.onHostingChange(null);
    }
}

module.exports = new DisableHostModeModule();
