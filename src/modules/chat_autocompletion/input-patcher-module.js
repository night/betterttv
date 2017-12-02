const emotes = require('../emotes');
const twitch = require('../../utils/twitch');
const debounce = require('lodash.debounce');

const BTTV_EMOTES_ID = 'bttv-emotes';

function bttvEmToTwitch(bttvEm) {
    return {
        displayName: bttvEm.code,
        srcSet: Object.values(bttvEm.images).join(', '),
        id: `${bttvEm.id}`,
        token: bttvEm.code,
        __typename: 'Emote'
    };
}

const NOPE = () => {};

class InputPatcherModule {
    constructor() {
        this.debounceLoadEmotes = debounce(() => {
            this.loadEmotes();
        }, 4000, { leading: true, trailing: false });

        this.load = NOPE;
        this.onFocus = NOPE;
    }

    loadEmotes() {
        const controller = twitch.getChatInputController();

        const emotesFormatted = emotes.getEmotes()
            .filter(em => !em.code.startsWith(':')) // emojis or any emote using special char break the chat.
            .map(bttvEmToTwitch);

        const emotesEntry = Object.values(controller.props.emotes)
            .find(v => v.id === BTTV_EMOTES_ID);

        if (emotesEntry) {
            emotesEntry.emotes = emotesFormatted;
        } else {
            controller.props.emotes.push({
                id: BTTV_EMOTES_ID,
                emotes: emotesFormatted
            });
        }
    }

    onKeydown() {
        this.debounceLoadEmotes();
    }
}

module.exports = InputPatcherModule;
