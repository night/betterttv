const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');
const Raven = require('raven-js');

const anonChat = require('../chat_commands');
const chatCommands = require('../anon_chat');
const tabCompletion = require('../tab_completion');
const emojis = require('../emotes/emojis');
const socketClient = require('../../socket-client');

const TEXTAREA_SELECTOR = '.textarea-contain';
const CHAT_TEXT_AREA = '.ember-chat .chat-interface textarea';

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
    msgObj => tabCompletion.onSendMessage(msgObj),
    msgObj => chatCommands.onSendMessage(msgObj),
    msgObj => anonChat.onSendMessage(msgObj),
    msgObj => emojis.onSendMessage(msgObj),
];

function bttvSendMessage() {
    const channel = twitch.getCurrentChannel();
    if (channel) {
        socketClient.broadcastMe(channel.name);
    }

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
    if (sendState.defaultPrevented) return;

    twitchSendMessage.apply(this, arguments);
}

class SendMessagePatcher {
    constructor() {
        watcher.on('load.chat_settings', () => this.patch());
    }

    patch() {
        // Set message box limit character to 500
        $(CHAT_TEXT_AREA).attr('maxlength', 500);

        const emberView = twitch.getEmberView($(TEXTAREA_SELECTOR).attr('id'));
        if (!emberView) return;

        const newTwitchSendMessage = emberView._actions.sendMessage;

        // check if we've already monkeypatched
        if (newTwitchSendMessage === bttvSendMessage || emberView._actions._bttvSendMessagePatched) return;

        emberView._actions.sendMessage = bttvSendMessage;
        emberView._actions._bttvSendMessagePatched = PATCHED_SENTINEL;
        twitchSendMessage = newTwitchSendMessage;
    }
}

module.exports = new SendMessagePatcher();
