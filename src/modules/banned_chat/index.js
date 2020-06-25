const settings = require('../../settings');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');
const anonChat = require('../anon_chat/index');

class BannedChatModule {
    constructor() {
        settings.add({
            id: 'bannedChat',
            name: 'Display Chat if Banned',
            defaultValue: false,
            description: 'Show chat messages even if permanently banned from the channel'
        });

        watcher.on('load', () => this.attachBannedChatSocketListener());
        watcher.on('load.chat', () => this.displayChatComponent());
    }

    displayChatComponent() {
        if (settings.get('bannedChat')) {
            const currentUserBannedNode = twitch.getCurrentUserBannedStateNode();
            if (currentUserBannedNode) {
                currentUserBannedNode.isCurrentUserBanned = () => false;
            }

            const userBannedNode = twitch.getUserBannedStateNode();
            if (userBannedNode) {
                userBannedNode.isUserBanned = () => false;
            }
        }
    }

    attachBannedChatSocketListener() {
        // If Anon Chat is enabled, no need to listen for banned socket response as the user will always be anonymous.
        if (settings.get('bannedChat') && !settings.get('anonChat')) {
            const client = twitch.getChatServiceClient();
            if (!client) return;

            const socket = client.connection.ws;
            if (!socket || socket.isBannedChatListenerAttached) return;

            socket.isBannedChatListenerAttached = true;
            socket.addEventListener('message', event => {
                if (this.userBannedFromChannelMessage(event)) {
                    anonChat.part();
                } else if (this.leavingChannelMessage(event)) {
                    anonChat.join();
                }
            });
        }
    }

    userBannedFromChannelMessage(event) {
        return event.data && event.data.startsWith('@msg-id=msg_banned');
    }

    leavingChannelMessage(event) {
        return event.data && event.data.startsWith(':') && event.data.includes('PART');
    }
}

module.exports = new BannedChatModule();
