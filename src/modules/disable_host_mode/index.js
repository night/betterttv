const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let oldChannelIsHosting;
function newChannelIsHosting() {
    if (settings.get('disableHostMode')) return false;
    oldChannelIsHosting.call(this, ...arguments);
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
        const channelController = twitch.getChannelController();
        if (!channelController) return;

        if (channelController.channelIsHosting !== newChannelIsHosting) {
            oldChannelIsHosting = channelController.channelIsHosting;
            channelController.channelIsHosting = newChannelIsHosting;
        }

        if (!settings.get('disableHostMode')) return;

        channelController.setState({
            hostMode: null,
            videoPlayerSource: channelController.props.match.params.channelName,
        });

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
            if (!settings.get('disableHostMode')) return;

            channelController.setState({
                hostMode: null,
                videoPlayerSource: channelController.props.match.params.channelName
            });
        });
    }
}

module.exports = new DisableHostModeModule();
