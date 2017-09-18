const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const CHAT_STATE_ID = 'bttv-channel-state-contain';
const CHAT_STATE_TEMPLATE = require('./template')(CHAT_STATE_ID);
const CHAT_HEADER_SELECTOR = '.chat__pane .chat__header';

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
        const connectRoot = twitch.getConnectRoot();
        if (!connectRoot || listening) return;

        try {
            const {store} = connectRoot._context;
            store.subscribe(() => {
                try {
                    this.updateState(store);
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
            if (messages[i].type !== 16) continue;
            message = messages[i];
            break;
        }
        if (!message || message === lastStateMessage) return;

        const $stateContainer = $(`#${CHAT_STATE_ID}`);
        if (!$stateContainer.length) return;

        lastStateMessage = message;

        const {slowMode, emoteOnlyMode, subsOnlyMode, r9k} = message.state;

        if (slowMode) {
            $stateContainer
                .find('.slow-time')
                .attr('title', `${slowMode} seconds`)
                .text(displaySeconds(slowMode));
        }
        $stateContainer.find('.slow').toggle(slowMode ? true : false);
        $stateContainer.find('.slow-time').toggle(slowMode ? true : false);

        $stateContainer.find('.r9k').toggle(r9k ? true : false);

        $stateContainer.find('.subs-only').toggle(subsOnlyMode ? true : false);

        $stateContainer.find('.emote-only').toggle(emoteOnlyMode ? true : false);
    }
}

module.exports = new ChatStateModule();
