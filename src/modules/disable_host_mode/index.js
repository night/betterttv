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

let oldOnChatHostingChange;
function newOnChatHostingChange() {
    if (settings.get('disableHostMode')) return null;
    oldOnChatHostingChange.call(this, ...arguments);
}

let lastPlayer;
function configurePlayerListener(count = 0) {
    const currentPlayer = twitch.getCurrentPlayer();
    if (!currentPlayer || !currentPlayer.player) {
        if (count > 100) return;
        // the player isn't loaded, so we need to wait for it to load before we apply this
        setTimeout(() => configurePlayerListener(count + 1), 10);
    }

    if (currentPlayer.player === lastPlayer) return;
    lastPlayer = currentPlayer.player;

    currentPlayer.player.addEventListener('playing', () => {
        const currentChannel = twitch.getCurrentChannel();
        if (currentPlayer.player.getChannel() === currentChannel.name) return;
        if (!settings.get('disableHostMode')) return;
        const channelController = twitch.getChannelController();
        if (!channelController) return;
        if (channelController.handleHostingChange) {
            channelController.handleHostingChange(null);
        } else {
            channelController.setState({
                hostMode: null,
                videoPlayerSource: channelController.state.channelLogin,
            });
        }
    });
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

        if (channelController._bttvPatched) return;
        channelController._bttvPatched = true;

        if (channelController.getHostedChannelLogin && channelController.getHostedChannelLogin !== newGetHostedChannelLogin) {
            oldGetHostedChannelLogin = channelController.getHostedChannelLogin;
            channelController.getHostedChannelLogin = newGetHostedChannelLogin;
        }

        if (channelController.handleHostingChange && channelController.handleHostingChange !== newHandleHostingChange) {
            oldHandleHostingChange = channelController.handleHostingChange;
            channelController.handleHostingChange = newHandleHostingChange;
        }

        if (channelController.onChatHostingChange && channelController.onChatHostingChange !== newOnChatHostingChange) {
            oldOnChatHostingChange = channelController.onChatHostingChange;
            channelController.onChatHostingChange = newOnChatHostingChange;
        }

        if (settings.get('disableHostMode')) {
            if (channelController.handleHostingChange) {
                channelController.handleHostingChange(null);
            } else {
                channelController.setState({
                    hostMode: null,
                    videoPlayerSource: channelController.state.channelLogin,
                });
            }
        }

        configurePlayerListener();
    }
}

module.exports = new DisableHostModeModule();
