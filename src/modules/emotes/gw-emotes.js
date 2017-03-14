const socketClientGW = require('../emotes_gamewisp/socket-client-gw');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');
const provider = {
    id: 'gw',
    displayName: 'GameWisp Emotes',
    badge: 'https://d32y8axfzs6sv8.cloudfront.net/static/gamewisp_transparent_18px.png'
};

// let joinedChannel;

class GWEmotes extends AbstractEmotes {
    constructor() {
        super();

        socketClientGW.on('initialize_room', data => this.initializeRoom(data));

        // TODO:
        socketClientGW.on('update_room', data => this.updateRoom(data));
        socketClientGW.on('leave_room', data => this.leaveRoom(data));
        socketClientGW.on('remove_emote', data => this.removeEmote(data));
        socketClientGW.on('add_emote', data => this.addEmote(data));
        socketClientGW.on('new_subscriber', data => this.newSubscriber(data));
        socketClientGW.on('cancel_subscriber', data => this.cancelSubscriber(data));

        watcher.on('load.chat', () => this.joinRoom());
    }

    get provider() {
        return provider;
    }

    getEmotes(user) {
        if (!user) return [];

        const emotes = this.emotes.get(user.name);
        if (!emotes) return [];

        return [...emotes.values()];
    }

    getEligibleEmote(code, user) {
        if (!user) return;

        const emotes = this.emotes.get(user.name);
        if (!emotes) return;

        return emotes.get(code);
    }


    joinRoom() {
        console.log('GW EMOTES: JOINING CHANNEL');

        const {name} = twitch.getCurrentChannel();
        // if (name !== joinedChannel) {
        //     socketClientGW.partChannel(joinedChannel);
        // }

        // joinedChannel = name;
        socketClientGW.joinRoom(name);
    }

    initializeRoom(data) {
        console.log('initializeRoom called from gw-emotes', data);

        let emotes = data.emotes ? data.emotes : [];

        emotes = emotes.map(gwEmote => {
            return new Emote({
                id: gwEmote.id,
                provider: this.provider,
                channel: gwEmote.channel,
                code: gwEmote.code,
                images: {
                    '1x': gwEmote.url,
                },
                imgType: 'png'
            });
        });

        for (const username in data.userStore) {
            if (data.userStore.hasOwnProperty(username)) {
                let userEmotes = this.emotes.get(name);
                if (!userEmotes) {
                    userEmotes = new Map();
                    this.emotes.set(username, userEmotes);
                }

                const emoteIDsSet = new Set(data.userStore[username]);

                emotes.forEach( e => {
                    if (emoteIDsSet.has(e.id)) {
                        userEmotes.set(e.code, e);
                    }
                });
            }
        }

        console.log('this.emotes', this.emotes);
    }

    updateRoom(data) {
        console.log('updateRoom called from gw-emotes', data);
    }

    leaveRoom(data) {
        console.log('leaveRoom called from gw-emotes', data);
    }

    removeEmote(data) {
        console.log('removeEmote called from gw-emotes', data);
    }

    addEmote(data) {
        console.log('addEmote called from gw-emotes', data);
    }

    newSubscriber(data) {
        console.log('newSubscriber called from gw-emotes', data);
    }

    cancelSubscriber(data) {
        console.log('cancelSubscriber called from gw-emotes', data);
    }

}

module.exports = new GWEmotes();
