const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const tmiApi = require('../../utils/tmi-api');

const SHARE_BUTTON_SELECTOR = '.channel-info-bar__action-container .tw-mg-x-1:first';
const SUBSCRIBE_BUTTON_SELECTOR = 'div[data-test-selector="subscribe-button__balloon-layer-btn"]';
const HOST_BUTTON_ID = 'bttv-host-button';

let $hostButton;
let $newHostButton;
let hosting = false;

const buttonTemplate = `
    <div class="tw-mg-r-1">
        <button id="${HOST_BUTTON_ID}" class="tw-button tw-button--hollow">
            <span class="tw-button__text">Host Channel</span>
        </button>
    </div>
`;

const newButtonTemplate = `
    <button class="${HOST_BUTTON_ID} tw-interactive tw-button tw-button--full-width tw-button--text" tabindex="0">
        <span class="tw-button__text" data-a-target="tw-button-text">Host Channel</span>
    </button>
`;

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
        if (!currentChannel || currentUser.id === currentChannel.id) return;

        $hostButton = $(buttonTemplate);
        $newHostButton = $(newButtonTemplate);
        this.embedHostButton();
        this.embedNewHostButton();
        this.updateHostingState(currentUser.id, currentChannel.id);
    }

    embedHostButton() {
        if ($(`#${HOST_BUTTON_ID}`).length) return;
        $hostButton.insertAfter(SHARE_BUTTON_SELECTOR);
        $hostButton.click(() => this.toggleHost());
    }

    embedNewHostButton() {
        if ($(`.${HOST_BUTTON_ID}`).length) return;
        $newHostButton.insertBefore(SUBSCRIBE_BUTTON_SELECTOR);
        $newHostButton.click(() => this.toggleHost());
    }

    toggleHost() {
        const currentUser = twitch.getCurrentUser();
        const command = hosting ? 'unhost' : 'host';
        try {
            const channelName = twitch.getCurrentChannel().name;
            const rawMessage = `PRIVMSG #${currentUser.name} :/${command === 'host' ? `${command} ${channelName}` : command}`;
            twitch.getChatServiceSocket().send(rawMessage);
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

    updateHostingState(userId, channelId) {
        return tmiApi.get('hosts', {qs: {host: userId}})
            .then(({hosts}) => {
                if (!Array.isArray(hosts) || !hosts.length) return;
                const host = hosts[0];
                if (!host || !host.target_id) return;
                hosting = host.target_id.toString() === channelId;
                this.updateHostButtonText();
            });
    }

    updateHostButtonText() {
        const text = hosting ? 'Unhost Channel' : 'Host Channel';
        $hostButton.find('span').text(text);
    }

    unload() {
        if (!$hostButton) return;
        $hostButton.remove();
    }
}

module.exports = new HostButtonModule();
