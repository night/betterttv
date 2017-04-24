const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

let $hostButton;
let hosting = false;

class HostButtonModule {
    constructor() {
        settings.add({
            id: 'hostButton',
            name: 'Host Button',
            defaultValue: false,
            description: 'Places a Host/Unhost button below the video player'
        });
        settings.on('changed.hostButton', value => value === true ? this.load() : this.unload());
        watcher.on('load.chat', () => this.load());
    }

    load() {
        if (settings.get('hostButton') === false) return;

        const currentUser = twitch.getCurrentUser();
        if (!currentUser) return;
        this.embedHostButton();
        this.updateHostingState(currentUser.id);
    }

    embedHostButton() {
        if ($('#bttv-host-button').length) return;
        $hostButton = $('<button><span>Host</span></button>');
        $hostButton.attr('id', 'bttv-host-button');
        $hostButton.addClass('button action button--hollow mg-l-1');
        $hostButton.insertAfter('#channel .cn-metabar__more .js-share-box');
        $hostButton.click(() => this.toggleHost());
    }

    toggleHost() {
        const currentUser = twitch.getCurrentUser();
        const command = hosting ? 'unhost' : 'host';
        try {
            const channelName = twitch.getCurrentChannel().name;
            const conn = twitch.getCurrentTMISession()._connections.main;
            conn._send(`PRIVMSG #${currentUser.name} :/${command === 'host' ? `${command} ${channelName}` : command}`);
            hosting = !hosting;
            this.updateHostButtonText();
            twitch.sendChatAdminMessage(`BetterTTV: We sent a /${command} to your channel.`);
        } catch (e) {
            twitch.sendChatAdminMessage(`
                BetterTTV: There was an error ${command}ing the channel.
                You may need to ${command} it from your channel.
            `);
        }
    }

    updateHostButtonText() {
        const text = hosting ? 'Unhost' : 'Host';
        $hostButton.find('span').text(text);
    }

    updateHostingState(userId) {
        const currentChannel = twitch.getCurrentChannel();
        if (!currentChannel) return;

        const channelId = currentChannel.id;
        const tmiSession = twitch.getCurrentTMISession();
        if (!tmiSession) return;

        tmiSession._tmiApi
            .get('/hosts', {host: userId})
            .then(data => {
                if (!data.hosts || !data.hosts.length) return;
                hosting = data.hosts[0].target_id === channelId;
                this.updateHostButtonText();
            });
    }

    unload() {
        if (!$hostButton) return;
        $hostButton.remove();
    }
}

module.exports = new HostButtonModule();
