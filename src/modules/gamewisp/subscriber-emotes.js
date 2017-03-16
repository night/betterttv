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
        const {name} = twitch.getCurrentChannel();

        socketClient.joinRoom(name);
    }

    initializeRoom({userStore, emotes}) {
        emotes = emotes.map(emoteData => buildEmote(emoteData)) || [];

        for (const username in userStore) {
            if (userStore.hasOwnProperty(username)) {
                let userEmotes = this.emotes.get(name);
                if (!userEmotes) {
                    userEmotes = new Map();
                    this.emotes.set(username, userEmotes);
                }

                const emoteIDsSet = new Set(userStore[username]);

                emotes.forEach(e => {
                    if (emoteIDsSet.has(e.id)) {
                        userEmotes.set(e.code, e);
                    }
                });
            }
        }

        console.log('this.emotes', this.emotes);
    }

    updateRoom({emotes, user}) {
        let newEmotes = emotes || [];

        newEmotes = newEmotes.map(emoteData => buildEmote(emoteData));

        let userEmotes = this.emotes.get(user.name);
        if (!userEmotes) {
            userEmotes = new Map();
            this.emotes.set(user.name, userEmotes);
        }

        const userEmoteIDsSet = new Set(user.emoteIDs);

        newEmotes.forEach(e => {
            if (userEmoteIDsSet.has(e.id)) {
                userEmotes.set(e.code, e);
            }
        });

        console.log('this.emotes', this.emotes);
    }

    leaveRoom({user}) {
        if (this.emotes.get(user)) {
            this.emotes.delete(user);
        }
        console.log('this.emotes', this.emotes);
    }

    removeEmote({emoteCode}) {
        const emotes = [...this.emotes.values()];

        emotes.forEach(emoteMap => {
            emoteMap.delete(emoteCode);
        });

        console.log('this.emotes', this.emotes);
    }

    addEmote({emote, emoteUsers}) {
        emote = buildEmote(emote);

        let userEmotes;

        emoteUsers.forEach(user => {
            if (this.emotes.has(user)) {
                userEmotes = this.emotes.get(user);
            } else {
                userEmotes = new Map();
                this.emotes.set(user, userEmotes);
            }

            userEmotes.set(emote.code, emote);
        });

        console.log('this.emotes', this.emotes);
    }

    newSubscriber({user, emotes}) {
        const newSub = user;
        let userEmotes;

        if (this.emotes.has(newSub)) {
            userEmotes = this.emotes.get(newSub);
        } else {
            userEmotes = new Map();
            this.emotes.set(newSub, userEmotes);
        }

        emotes.forEach(gwEmote => {
            userEmotes.set(gwEmote.code, buildEmote(gwEmote));
        });

        console.log('this.emotes', this.emotes);
    }

    cancelSubscriber({user, emoteIDs}) {
        if (!this.emotes.has(user)) return;

        const emoteIDsToRemove = new Set(emoteIDs);
        const userEmotes = this.emotes.get(user);

        userEmotes.forEach(emote => {
            if (emoteIDsToRemove.has(emote.id)) {
                userEmotes.delete(emote.code);
            }
        });

        console.log('this.emotes', this.emotes);
    }
}

module.exports = new SubscriberEmotes();
