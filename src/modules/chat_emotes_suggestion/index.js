const $ = require('jquery');
const emotes = require('../emotes');
const twitch = require('../../utils/twitch');
const debounce = require('lodash.debounce');

const BTTV_EMOTES_STORE_ID = 'bttv-emotes';
const CHAT_INPUT = '.chat-input';

function bttvEmToTwitch(bttvEm) {
    return {
        displayName: bttvEm.code,
        srcSet: Object.values(bttvEm.images).join(', '),
        id: `${bttvEm.id}`,
        token: bttvEm.code,
        __typename: 'Emote'
    };
}

function getBttvEmotesAsTwitchEmotes() {
    return emotes.getEmotes()
        .filter(em => !em.code.startsWith(':')) // emojis or any emote using special char break the chat.
        .map(bttvEmToTwitch);
}

function getParentNode(reactElement) {
    try {
        return reactElement._owner._currentElement._owner;
    } catch (_) {
        return null;
    }
}

function getChatInputController() {
    const container = document.querySelector(CHAT_INPUT);
    if (!container) return null;
    let controller;
    try {
        controller = getParentNode(twitch.getReactElement(container))._instance;
    } catch (_) {}

    return controller;
}

class ChatEmotesSuggestion {
    constructor() {
        const debounceLoadEmotes = debounce(() => this.loadEmotes(), 500, { leading: true, trailing: false });
        $('body').on('keydown', CHAT_INPUT, () => {
            debounceLoadEmotes();
        });
    }

    validateEmoteStore() {
        const controller = getChatInputController();
        if (!controller) return;
        if (!controller.props || !controller.props.emotes) return;

        const emotesStore = controller.props.emotes;
        if (!(emotesStore instanceof Array) || emotesStore.length === 0) return;

        const twitchEmotes = emotesStore[0];
        if (!twitchEmotes || !twitchEmotes.id || !twitchEmotes.emotes) return;

        if (typeof twitchEmotes.id !== 'string' && !(twitchEmotes.emotes instanceof Array)) return;
        return true;
    }

    loadEmotes() {
        if (!this.validateEmoteStore()) return;
        const controller = getChatInputController();
        const emotesFormatted = getBttvEmotesAsTwitchEmotes();
        const emotesEntry = Object.values(controller.props.emotes)
            .find(v => v.id === BTTV_EMOTES_STORE_ID);

        if (emotesEntry) {
            emotesEntry.emotes = emotesFormatted;
        } else {
            controller.props.emotes.push({
                id: BTTV_EMOTES_STORE_ID,
                emotes: emotesFormatted
            });
        }
    }
}


module.exports = new ChatEmotesSuggestion();
