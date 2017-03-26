const twitch = require('../../utils/twitch');

const anonChat = require('../chat_commands');
const chatCommands = require('../anon_chat');
const emojis = require('../emotes/emojis');
const watcher = require('../../watcher');

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
    chatCommands.onSendMessage,
    anonChat.onSendMessage,
    emojis.onSendMessage,
];

function bttvSendMessage() {
    const sendState = new SendState(this.get('room.messageToSend'));

    for (const method of methodList) {
        try {
            method(sendState);
        } catch (e) {
            Raven.captureException(e);
            debug.log(e);
        }
    }

    this.set('room.messageToSend', sendState.message);
    if (defaultPrevented) return;

    twitchSendMessage.apply(this, arguments);
}

class SendMessagePatcher {
    constructor() {
        watcher.on('load.chat_settings', () => this.patch());
    }

    patch() {
        const emberView = twitch.getEmberView($(TEXTAREA_SELECTOR).attr('id'));
        if (!emberView) return;

        const newTwitchSendMessage = emberView._actions.sendMessage;

        // check if we've already monkeypatched
        if (newTwitchSendMessage === bttvSendMessage) return;

        emberView._actions.sendMessage = bttvSendMessage;
        twitchSendMessage = newTwitchSendMessage;
    }
}

module.exports = new SendMessagePatcher();
