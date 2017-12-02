const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const twitch = require('../../utils/twitch');
const tmiApi = require('../../utils/tmi-api');

const SHARE_BUTTON_SELECTOR = '.channel-info-bar__action-container .mg-x-1:first';
const HOST_BUTTON_ID = 'bttv-host-button';

let $hostButton;
let hosting = false;

function getSocket() {
    let socket;
    try {
        socket = twitch.getChatController().chatService.client.connection.ws;
    } catch (_) {}
    return socket;
}

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
        this.updateHostingState(currentUser.id, currentChannel.name);
    }

    embedHostButton() {
        if ($(`#${HOST_BUTTON_ID}`).length) return;

        $hostButton = $(SHARE_BUTTON_SELECTOR).clone();
        this.updateHostButtonText();
        $hostButton.attr('id', HOST_BUTTON_ID);
        $hostButton.insertAfter(SHARE_BUTTON_SELECTOR);

        $hostButton.click(() => this.toggleHost());
    }

    toggleHost() {
        const currentUser = twitch.getCurrentUser();
        const command = hosting ? 'unhost' : 'host';
        try {
            const currentChannel = twitch.getCurrentChannel();
            const channelName = currentChannel.name;
            const wsMessage = `PRIVMSG ${currentUser.name} : /${command === 'host' ? `${command} ${channelName}` : command}`;
            getSocket().send(wsMessage);
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

    updateHostingState(userId, channelName) {
        return tmiApi.getHostedChannel(userId)
            .then(data => {
                hosting = data.target_login === channelName;
                this.updateHostButtonText();
            })
            .catch(error => {
                debug.log('error updatingHostingState');
                debug.error(error);
            });
    }

    updateHostButtonText() {
        const text = hosting ? 'Unhost' : 'Host';
        $hostButton.find('.tw-button__text').text(text);
    }

    unload() {
        $(`#${HOST_BUTTON_ID}`).remove();
        $hostButton = null;
    }
}

module.exports = new HostButtonModule();
