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
    }

    embedHostButton() {
        if ($('#bttv-host-button').length) return;
        $hostButton = $('<button><span>Host</span></button>');
        $hostButton.attr('id', 'bttv-host-button');
        $hostButton.addClass('button action button--hollow mg-l-1');
        $hostButton.appendTo('.channel-info-bar__action-container');
        $hostButton.click(() => this.toggleHost());
    }

    toggleHost() {
        const command = hosting ? 'unhost' : 'host';
        try {
            const channelName = twitch.getCurrentChannel().name;
            twitch.sendChatMessage(`/${command === 'host' ? `${command} ${channelName}` : command}`);
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

    unload() {
        if (!$hostButton) return;
        $hostButton.remove();
    }
}

module.exports = new HostButtonModule();
