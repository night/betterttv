const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let oldHostingHandler;
function newHostingHandler() {
    if (settings.get('disableHostMode')) return;
    oldHostingHandler.call(this, ...arguments);
}

let lastPlayer;

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

    load(count = 0) {
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

        const currentPlayer = twitch.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.player) {
            if (count > 100) return;
            // the player isn't loaded, so we need to wait for it to load before we apply this
            setTimeout(() => this.load(count + 1), 10);
        }

        if (currentPlayer.player === lastPlayer) return;
        lastPlayer = currentPlayer.player;

        currentPlayer.player.addEventListener('playing', () => {
            const currentChannel = twitch.getCurrentChannel();
            if (currentPlayer.player.getChannel() === currentChannel.name) return;

            chatController.props.onHostingChange(null);
        });
    }
}

module.exports = new DisableHostModeModule();
