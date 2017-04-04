const watcher = require('../../watcher');
const api = require('../../utils/api');
const debug = require('../../utils/debug');
const twitch = require('../../utils/twitch');
const html = require('../../utils/html');

class ChannelEmotesTipModule {
    constructor() {
        this.sets = {};
        this.ids = {};

        this.updateEmoteLists();
        watcher.on('load.chat', () => this.checkEmoteSets());
    }

    updateEmoteLists() {
        api.get('emotes/sets')
            .then(({sets}) => {
                this.sets = sets;
            });

        api.get('emotes/ids')
            .then(({ids}) => {
                this.ids = ids;
            });
    }

    getEmoteBalloon(id, code) {
        const channel = this.ids[id];
        return `
            ${html.escape(code)}<br>
            ${channel ? `Channel: ${html.escape(channel)}` : ''}
        `;
    }

    checkEmoteSets() {
        const room = twitch.getCurrentChat();
        if (!room || !room.product || !Array.isArray(room.product.emoticons)) return;

        const activeEmote = room.product.emoticons.find(emote => emote.state === 'active');
        if (!activeEmote || this.sets[activeEmote.emoticon_set]) {
            debug.log(`Channel set exists for ${room.product.name}, no need to give a tip`);
            return;
        }

        api.post(`emotes/channel_tip/${room.product.name}`)
            .then(() => debug.log(`Gave a channel tip for ${room.product.name}`));
    }
}

module.exports = new ChannelEmotesTipModule();
