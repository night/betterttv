const emotes = require('../emotes');
const twitch = require('../../utils/twitch');
const watcher = require('../../watcher');

const BTTV_EMOTES_STORE_ID = 'bttv-emotes';

function esca(str) {
    return str.replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\'/g, "\\'");
}

function bttvEmToTwitch(bttvEm) {
    return {
        displayName: bttvEm.code,
        srcSet: Object.values(bttvEm.images).join(', '),
        id: `${bttvEm.id}`,
        token: esca(bttvEm.code),
        __typename: 'Emote'
    };
}

function getBttvEmotesAsTwitchEmotes(emoteGetter) {
    return emoteGetter()
        .map(bttvEmToTwitch);
}

class ChatEmotesSuggestion {
    constructor() {
        let intervalId;
        watcher.on('emotes.updated', () => {
            clearInterval(intervalId);
            let retry = 15;
            intervalId = setInterval(() => {
                this.applyNewStore();
                retry--;
                if (retry <= 0) {
                    clearInterval(intervalId);
                }
            }, 500);
        });
    }

    validateEmoteStore() {
        const controller = twitch.getChatController();
        if (!controller) return;
        if (!controller.props || !controller.props.emoteSets) return;

        const emotesStore = controller.props.emoteSets;
        if (!(emotesStore instanceof Array) || emotesStore.length === 0) return;

        const twitchEmotes = emotesStore[0];
        if (!twitchEmotes || !twitchEmotes.id || !twitchEmotes.emotes) return;

        if (typeof twitchEmotes.id !== 'string' && !(twitchEmotes.emotes instanceof Array)) return;
        return true;
    }

    emotes() {
        return getBttvEmotesAsTwitchEmotes(() => emotes.getEmotes());
    }

    cloneTwitchEmotes() {
        const emoteStore = twitch.getConnectRoot()._context.store.getState().chat.emoteSets;
        const myStore = [];
        for (const entry of emoteStore) {
            if (entry.id === BTTV_EMOTES_STORE_ID) continue;
            const myEntry = { id: entry.id, emotes: []};
            myStore.push(myEntry);
            for (const em of entry.emotes) {
                myEntry.emotes.push(em);
            }
        }
        return myStore;
    }

    createNewStore() {
        const st = this.cloneTwitchEmotes();
        const bttvEmotes = this.emotes();
        st.push({
            id: BTTV_EMOTES_STORE_ID,
            emotes: bttvEmotes
        });
        return [st, bttvEmotes];
    }

    applyNewStore() {
        if (!this.validateEmoteStore()) return;

        const [st, bttvEmotes] = this.createNewStore();
        twitch.getChatController().props.emoteSets = st;
        return bttvEmotes.length;
    }
}

module.exports = new ChatEmotesSuggestion();
