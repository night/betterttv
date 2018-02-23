const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const CHAT_STATE_ID = 'bttv-channel-state-contain';
const CHAT_STATE_TEMPLATE = require('./template')(CHAT_STATE_ID);
const CHAT_HEADER_SELECTOR = 'div[data-test-selector="chat-room-component-layout"] .chat-room__header';

let listening = false;
let lastStateMessage;

function displaySeconds(s) {
    let date = new Date(0);
    date.setSeconds(s);
    date = date.toISOString().substr(11, 8);
    date = date.split(':');

    while (date[0] === '00') {
        date.shift();
    }

    if (date.length === 1 && date[0].charAt(0) === '0') {
        date[0] = parseInt(date[0], 10);
    }

    return date.join(':');
}

class ChatStateModule {
    constructor() {
        watcher.on('load', () => this.load());
        watcher.on('load.chat', () => this.loadHTML());
    }

    loadHTML() {
        if ($(`#${CHAT_STATE_ID}`).length) return;
        $(CHAT_HEADER_SELECTOR).append(CHAT_STATE_TEMPLATE);
    }

    load() {
        const connectStore = twitch.getConnectStore();
        if (!connectStore || listening) return;

        try {
            connectStore.subscribe(() => {
                try {
                    this.updateState(connectStore);
                } catch (_) {}
            });
            listening = true;
        } catch (_) {}
    }

    updateState(store) {
        let {chat: {messages}} = store.getState();
        messages = Object.values(messages)[0];
        if (!messages) return;

        let message;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].type !== twitch.TMIActionTypes.ROOM_STATE) continue;
            message = messages[i];
            break;
        }
        if (!message || message === lastStateMessage) return;

        const $stateContainer = $(`#${CHAT_STATE_ID}`);
        if (!$stateContainer.length) return;

        lastStateMessage = message;

        const {slowMode, slowModeDuration, emoteOnly, subsOnly, r9k} = message.state;

        if (slowMode) {
            $stateContainer
                .find('.slow-time')
                .attr('title', `${slowModeDuration} seconds`)
                .text(displaySeconds(slowModeDuration));
        }
        $stateContainer.find('.slow').toggle(slowMode ? true : false);
        $stateContainer.find('.slow-time').toggle(slowMode ? true : false);

        $stateContainer.find('.r9k').toggle(r9k ? true : false);

        $stateContainer.find('.subs-only').toggle(subsOnly ? true : false);

        $stateContainer.find('.emote-only').toggle(emoteOnly ? true : false);
    }
}

module.exports = new ChatStateModule();
