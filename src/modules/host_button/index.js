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
        const currentChannel = twitch.getCurrentChannel();
        if (!currentUser || !currentChannel) return;
        if (currentUser.id === currentChannel.id) return;
        this.embedHostButton();
        this.updateHostingState(currentUser.id, currentChannel.id);
    }

    embedHostButton() {
        if ($('#bttv-host-button').length) return;

        const $share = $('.channel-info-bar__action-container .mg-x-1').first();
        $hostButton = $share.clone();
        $hostButton.find('.tw-button__text').text('Host');
        $hostButton.attr('id', 'bttv-host-button');
        $hostButton.insertAfter($share);

        $hostButton.click(() => this.toggleHost());
    }

    toggleHost() {
        const currentUser = twitch.getCurrentUser();
        const command = hosting ? 'unhost' : 'host';
        try {
            const currentChannel = twitch.getCurrentChannel();
            const channelName = currentChannel.name;
            const conn = twitch.getChatController().chatService.client.connection.ws;
            const wsMessage = `PRIVMSG ${currentUser.name} : /${command === 'host' ? `${command} ${channelName}` : command}`;
            conn.send(wsMessage);
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
        $hostButton.find('.tw-button__text').text(text);
    }

    updateHostingState(userId, channelId) {
        return fetch(`https://tmi.twitch.tv/hosts?include_logins=1&host=${userId}`)
            .then(t => t.json())
            .then(({ hosts }) => {
                if (!hosts || !hosts.length) return;
                hosting = `${hosts[0].target_id}` === channelId;
                this.updateHostButtonText();
            });
    }

    unload() {
        $('#bttv-host-button').remove();
        $hostButton = null;
    }
}

module.exports = new HostButtonModule();
