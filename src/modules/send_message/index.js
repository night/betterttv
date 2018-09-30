const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const socketClient = require('../../socket-client');
const Raven = require('raven-js');

const chatTabCompletion = require('../chat_tab_completion');
const chatCommands = require('../chat_commands');
const anonChat = require('../anon_chat');
const emojis = require('../emotes/emojis');

const PATCHED_SENTINEL = Symbol();

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
    msgObj => chatTabCompletion.onSendMessage(msgObj),
    msgObj => chatCommands.onSendMessage(msgObj),
    msgObj => anonChat.onSendMessage(msgObj),
    msgObj => emojis.onSendMessage(msgObj)
];

function bttvSendMessage(messageToSend, ...args) {
    const channel = twitch.getCurrentChannel();
    if (channel) {
        socketClient.broadcastMe(channel.name);
    }

    if (typeof messageToSend === 'string') {
        const sendState = new SendState(messageToSend);

        for (const method of methodList) {
            try {
                method(sendState);
            } catch (e) {
                Raven.captureException(e);
                debug.log(e);
            }
        }

        if (sendState.defaultPrevented) return Promise.resolve();
        messageToSend = sendState.message;
    }

    return twitchSendMessage.call(this, messageToSend, ...args);
}

class SendMessagePatcher {
    constructor() {
        watcher.on('load.chat', () => this.patch());
    }

    patch() {
        const chatController = twitch.getChatController();
        if (!chatController) return;

        if (
            chatController._bttvSendMessagePatched === PATCHED_SENTINEL ||
            chatController.sendMessage === bttvSendMessage
        ) {
            return;
        }

        chatController._bttvSendMessagePatched = PATCHED_SENTINEL;
        twitchSendMessage = chatController.sendMessage;
        chatController.sendMessage = bttvSendMessage;
        chatController.forceUpdate();
    }
}

module.exports = new SendMessagePatcher();
