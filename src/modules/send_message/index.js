const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');

const chatCommands = require('../chat_commands');
const anonChat = require('../anon_chat');
const emojis = require('../emotes/emojis');

const PATCHED_SENTINEL = Symbol('bttvPatched');

function getConnectionClient() {
    let client;
    try {
        client = twitch.getChatController().chatService.client;
    } catch (_) {}
    return client;
}

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
    msgObj => chatCommands.onSendMessage(msgObj),
    msgObj => anonChat.onSendMessage(msgObj),
    msgObj => emojis.onSendMessage(msgObj)
];

function bttvSendMessage() {
    try {
        const messageToSend = arguments[1];
        if (!messageToSend) return;

        const sendState = new SendState(messageToSend);
        for (const method of methodList) {
            try {
                method(sendState);
            } catch (e) {
                debug.log(e);
            }
        }

        if (sendState.defaultPrevented) return;
        arguments[1] = sendState.message;
    } catch (error) {
        debug.log(error);
    }
    twitchSendMessage.apply(this, arguments);
}

class SendMessagePatcher {
    constructor() {
        watcher.on('load.chat', () => this.patch());
    }

    patch() {
        const client = getConnectionClient();
        if (!client) return;
        // check if we've already monkeypatched
        if (client._bttvSendMessagePatched === PATCHED_SENTINEL) return;
        client._bttvSendMessagePatched = PATCHED_SENTINEL;
        twitchSendMessage = client.sendCommand;
        client.sendCommand = bttvSendMessage;
    }
}

module.exports = new SendMessagePatcher();
