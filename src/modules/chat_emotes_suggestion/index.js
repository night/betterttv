// const $ = require('jquery');
const emotes = require('../emotes');
const twitch = require('../../utils/twitch');
// const watcher = require('../../watcher');
// const debounce = require('lodash.debounce');

const BTTV_EMOTES_STORE_ID = 'bttv-emotes';
// const BTTV_EMOTES_STORE_ID = '1';
// const CHAT_INPUT = '.chat-input';

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

window.emotes = emotes;
window.twitch = twitch;

function getBttvEmotesAsTwitchEmotes(emoteGetter) {
    // const idSet = new Set();
    // const codeSet = new Set();
    return emoteGetter()
        // .filter(em => isASCII(em.code))
        // .filter(em => {
        //     if (!idSet.has('' + em.id) || !codeSet.has(em.code)) {
        //         idSet.add('' + em.id);
        //         codeSet.add(em.code);
        //         return true;
        //     }
        //     return false;
        // })
        // .filter(em => !em.code.startsWith(':')) // emojis or any emote using special char break the chat.
        .map(bttvEmToTwitch);
}

class ChatEmotesSuggestion {
    constructor() {
        // const debounceLoadEmotes = debounce(() => this.loadEmotes(), 500, { leading: true, trailing: false });
        // $('body').on('keydown', CHAT_INPUT, () => {
        //     debounceLoadEmotes();
        // });
        window.AAA = this;
        // let timeout;
        // const checkForEmotes = () => {
        //     clearTimeout(timeout);
        //     const nb = this.applyNewStore();
        //     console.log('UPT');
        //     if (!nb) {
        //         timeout = setTimeout(() => {
        //             checkForEmotes();
        //         }, 500);
        //     }
        // };
        // watcher.on('emotes.updated', () => checkForEmotes());

        // watcher.on('load.chat', () => {
        //     const x = twitch.getChatController().updateEmoteSets;
        //     twitch.getChatController().updateEmoteSets = function(e) {
        //         console.log('EEE', e);
        //         window.EEE = e;
        //         return x.apply(this, arguments);
        //     };
        // });

        setInterval(() => {
            this.applyNewStore();
        }, 500);
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
        return getBttvEmotesAsTwitchEmotes(() => emotes.getEmotes()); // ['bttv-emoji']
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
        console.log('store updated');
        return bttvEmotes.length;
        // twitch.getConnectRoot()._context.store.getState().chat.emoteSets = st;
    }
}


module.exports = new ChatEmotesSuggestion();
