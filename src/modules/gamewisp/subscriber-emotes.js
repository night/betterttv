const socketClient = require('./socket-client');
const watcher = require('../../watcher');
const twitch = require('../../utils/twitch');

const AbstractEmotes = require('../emotes/abstract-emotes');
const Emote = require('../emotes/emote');

const provider = {
    id: 'gw-subscriber',
    displayName: 'GameWisp Subscriber Emotes',
    badge: 'https://d32y8axfzs6sv8.cloudfront.net/static/gamewisp_transparent_18px.png'
};

const buildEmote = ({id, channel, code, url}) => {
    return new Emote({
        id: id,
        provider: provider,
        channel: {name: channel},
        code: code,
        images: {
            '1x': url,
            '2x': url.replace('28x28', '56x56'),
            '4x': url.replace('28x28', '112x112')
        },
        imgType: 'png'
    });
};

class SubscriberEmotes extends AbstractEmotes {
    constructor() {
        super();

        this.emoteUsers = new Map();

        socketClient.on('initialize_room', data => this.initializeRoom(data));
        socketClient.on('update_room', data => this.updateRoom(data));
        socketClient.on('leave_room', data => this.leaveRoom(data));
        socketClient.on('remove_emote', data => this.removeEmote(data));
        socketClient.on('add_emote', data => this.addEmote(data));
        socketClient.on('new_subscriber', data => this.newSubscriber(data));
        socketClient.on('cancel_subscriber', data => this.cancelSubscriber(data));

        watcher.on('load.chat', () => this.joinRoom());
    }

    get provider() {
        return provider;
    }

    getEmotes(user) {
        if (!user) return [];

        const emoteIDs = this.emoteUsers.get(user.name);
        if (!emoteIDs) return [];

        const emotes = [];

        emoteIDs.forEach(id => {
            if (this.emotes.has(id)) {
                emotes.push(this.emotes.get(id));
            }
        });

        return emotes;
    }

    getEligibleEmote(code, user) {
        if (!user || !this.emoteUsers) return;

        const emoteIDs = this.emoteUsers.get(user.name);
        if (!emoteIDs) return;

        let emote;
        for (const id of emoteIDs) {
            emote = this.emotes.get(id);
            if (emote && emote.code === code) {
                return emote;
            }
        }

        return;
    }

    joinRoom() {
        const {name} = twitch.getCurrentChannel();

        socketClient.joinRoom(name);
    }

    initializeRoom({userStore, emotes}) {
        emotes = emotes.map(emoteData => buildEmote(emoteData)) || [];
        emotes.forEach(emote => this.emotes.set(emote.id, emote));

        for (const username in userStore) {
            if (userStore.hasOwnProperty(username)) {
                let userEmoteIDs = this.emotes.get(name);
                if (!userEmoteIDs) {
                    userEmoteIDs = [];
                }

                userEmoteIDs = [...userEmoteIDs, ...userStore[username]];

                this.emoteUsers.set(username, userEmoteIDs);
            }
        }

        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }

    updateRoom({emotes, user}) {
        let newEmotes = emotes || [];

        newEmotes = newEmotes.map(emoteData => buildEmote(emoteData));
        newEmotes.forEach(emote => this.emotes.set(emote.id, emote));

        let userEmoteIDs = this.emoteUsers.get(user.name);
        if (!userEmoteIDs) {
            userEmoteIDs = [];
        }

        userEmoteIDs = [...userEmoteIDs, ...user.emoteIDs];

        this.emoteUsers.set(user.name, userEmoteIDs);

        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }

    leaveRoom({user}) {
        if (this.emoteUsers.get(user)) {
            this.emoteUsers.delete(user);
        }
        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }

    removeEmote({emoteID}) {
        console.log('emoteID', emoteID);

        const emoteUsers = [...this.emoteUsers.values()];

        let idx;
        emoteUsers.forEach(emoteIDs => {
            idx = emoteIDs.indexOf(emoteID);

            if (idx >= 0) {
                emoteIDs.splice(idx, 1);
            }
        });

        if (this.emotes.has(emoteID)) {
            this.emotes.delete(emoteID);
        }

        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }

    addEmote({emote, emoteUsers}) {
        emote = buildEmote(emote);

        let userEmoteIDs;

        emoteUsers.forEach(user => {
            if (this.emoteUsers.has(user)) {
                userEmoteIDs = this.emoteUsers.get(user);
            } else {
                userEmoteIDs = [];
            }

            userEmoteIDs = [...userEmoteIDs, emote.id];

            this.emoteUsers.set(user, userEmoteIDs);
            this.emotes.set(emote.id, emote);
        });

        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }

    newSubscriber({user, emotes, emoteIDs}) {
        let userEmoteIDs;
        if (this.emoteUsers.has(user)) {
            userEmoteIDs = this.emoteUsers.get(user);
        } else {
            userEmoteIDs = [];
        }

        userEmoteIDs = [...userEmoteIDs, ...emoteIDs];
        this.emoteUsers.set(user, userEmoteIDs);

        emotes.forEach(emote => {
            if (!this.emotes.has(emote.id)) {
                this.emotes.set(emote.id, buildEmote(emote));
            }
        });

        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }

    cancelSubscriber({user, emoteIDs}) {
        console.log('cancelSubscriber', emoteIDs);
        if (!this.emoteUsers.has(user)) return;

        const userEmoteIDs = this.emoteUsers.get(user);

        let idx;
        emoteIDs.forEach(idToRemove => {
            idx = userEmoteIDs.indexOf(idToRemove);

            if (idx >= 0) {
                userEmoteIDs.splice(idx, 1);
            }
        });

        this.emoteUsers.set(user, userEmoteIDs);

        console.log('this.emotes', this.emotes);
        console.log('this.emoteUsers', this.emoteUsers);
    }
}

module.exports = new SubscriberEmotes();
