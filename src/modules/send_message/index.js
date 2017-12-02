const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');

const chatCommands = require('../chat_commands');
const anonChat = require('../anon_chat');
const socketClient = require('../../socket-client');

const PATCHED_SENTINEL = () => {};

class SendState {
    constructor(msg) {
        this.message = msg;
        this.defaultPrevented = false;
    }

    get user() {
        return twitch.getCurrentUser();
    }

    preventDefault() {
        this.defaultPrevented = true;
        this.message = '';
    }
}

let twitchSendMessage;
const methodList = [
    // msgObj => tabCompletion.onSendMessage(msgObj),
    msgObj => chatCommands.onSendMessage(msgObj),
    msgObj => anonChat.onSendMessage(msgObj)
];

function bttvSendMessage(channelName, messageToSend) {
    const channel = twitch.getCurrentChannel();
    if (channel) {
        socketClient.broadcastMe(channel.name);
    }

    const sendState = new SendState(messageToSend);

    for (const method of methodList) {
        try {
            method(sendState);
        } catch (e) {
            debug.log(e);
        }
    }

    if (sendState.defaultPrevented) return;
    messageToSend = sendState.message;
    twitchSendMessage.call(this, channelName, messageToSend);
}

class SendMessagePatcher {
    constructor() {
        watcher.on('load.chat', () => this.patch());
    }

    patch() {
        const client = twitch.getTmiClient();
        if (!client) return;

        const newTwitchSendMessage = client.sendCommand;
        // check if we've already monkeypatched
        if (newTwitchSendMessage === bttvSendMessage || client._bttvSendMessagePatched) return;

        client.sendCommand = bttvSendMessage;
        client._bttvSendMessagePatched = PATCHED_SENTINEL;
        twitchSendMessage = newTwitchSendMessage;
    }
}

module.exports = new SendMessagePatcher();
