const $ = require('jquery');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const CHAT_STATE_ID = 'bttv-channel-state-contain';
const CHAT_STATE_TEMPLATE = require('./template')(CHAT_STATE_ID);
const CHAT_HEADER_SELECTOR = '.rooms-header';
const CHAT_HEADER_PRIVATE_ROOM_SELECTOR = 'svg.tw-svg__asset--unlock';
const CHAT_SETTINGS_BUTTON_SELECTOR = 'button[data-a-target="chat-settings"]';
const PATCHED_SENTINEL = Symbol();

let twitchOnRoomStateUpdated;

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

function loadHTML() {
    const $stateContainer = $(`#${CHAT_STATE_ID}`);
    const $headerSelector = $(CHAT_HEADER_SELECTOR);
    const $chatSettingsButtonSelector = $(CHAT_SETTINGS_BUTTON_SELECTOR);
    if (!$headerSelector.length || $headerSelector.find(CHAT_HEADER_PRIVATE_ROOM_SELECTOR).length) {
        $stateContainer.remove();
        return;
    }
    if ($stateContainer.length) return;
    $chatSettingsButtonSelector.before(CHAT_STATE_TEMPLATE);
}

function updateState(state, ...args) {
    if (state) {
        twitchOnRoomStateUpdated(state, ...args);
    }

    if (!state) {
        const chatBuffer = twitch.getChatBuffer();
        if (!chatBuffer) return;
        const messages = chatBuffer.state.messages;
        if (!messages) return;

        let message;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].type !== twitch.TMIActionTypes.ROOM_STATE) continue;
            message = messages[i];
            break;
        }
        if (!message) return;

        state = message.state;
    }

    // always reload html in case it got removed
    loadHTML();

    const $stateContainer = $(`#${CHAT_STATE_ID}`);
    if (!$stateContainer.length) return;

    const {slowMode, slowModeDuration, emoteOnly, subsOnly, r9k} = state;

    if (slowMode) {
        $stateContainer
            .find('.slow-time')
            .attr('title', `${slowModeDuration} seconds`)
            .text(displaySeconds(slowModeDuration));
    }
    $stateContainer.find('.slow').css({display: slowMode ? 'block' : 'none'});
    $stateContainer.find('.slow-time').css({display: slowMode ? 'block' : 'none'});

    $stateContainer.find('.r9k').css({display: r9k ? 'block' : 'none'});

    $stateContainer.find('.subs-only').css({display: subsOnly ? 'block' : 'none'});

    $stateContainer.find('.emote-only').css({display: emoteOnly ? 'block' : 'none'});
}

class ChatStateModule {
    constructor() {
        watcher.on('load.chat', () => this.patch());
    }

    patch() {
        const chatController = twitch.getChatController();
        if (!chatController) return;

        updateState();

        if (
            chatController._bttvOnRoomStateUpdatedPatched === PATCHED_SENTINEL ||
            chatController.onRoomStateUpdated === updateState
        ) {
            return;
        }

        chatController._bttvOnRoomStateUpdatedPatched = PATCHED_SENTINEL;
        twitchOnRoomStateUpdated = chatController.onRoomStateUpdated;
        chatController.onRoomStateUpdated = updateState;
        chatController.forceUpdate();
    }
}

module.exports = new ChatStateModule();
