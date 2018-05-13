const watcher = require('../../watcher');
const api = require('../../utils/api');
// const debug = require('../../utils/debug');
// const twitch = require('../../utils/twitch');
const html = require('../../utils/html');

class ChannelEmotesTipModule {
    constructor() {
        this.ids = null;

        // TODO: this is expensive due to how large the emote sets have become
        //
        // this.updateEmoteLists();
        watcher.on('load.chat', () => this.checkEmoteSets());
    }

    updateEmoteLists() {
        api.get('twitch_emotes/ids')
            .then(({ids}) => {
                this.ids = ids;
            })
            .then(() => this.checkEmoteSets());
    }

    getEmote(id, code) {
        if (!this.ids) return null;

        const name = this.ids[id];
        if (!name) return null;

        return {
            id,
            code,
            channel: {
                name,
                url: `https://www.twitch.tv/${name}`
            },
            balloon: `
                ${html.escape(code)}<br>
                ${name ? `Channel: ${html.escape(name)}` : ''}
            `
        };
    }

    checkEmoteSets() {
        if (!this.ids) return null;

        // TODO: need a solution for this

        // const room = twitch.getCurrentChat();
        // if (!room || !room.product) return;

        // const {emoticons, name} = room.product;
        // if (!Array.isArray(emoticons) || !name) return;

        // const emote = emoticons.find(({state}) => state === 'active');
        // if (!emote || this.ids[emote.id]) {
        //     debug.log(`Channel set exists for ${name}, no need to give a tip`);
        //     return;
        // }

        // api.post('twitch_emotes/channel_tip', {body: {name}})
        //     .then(() => debug.log(`Gave a channel tip for ${name}`));
    }
}

module.exports = new ChannelEmotesTipModule();
