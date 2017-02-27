const socketClient = require('../../socket-client');
const watcher = require('../../watcher');
const mustacheFormat = require('../../utils/regex').mustacheFormat;
const twitch = require('../../utils/twitch');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');

const provider = {
    id: 'bttv-personal',
    displayName: 'BetterTTV Personal Emotes'
};

let joinedChannel;

class PersonalEmotes extends AbstractEmotes {
    constructor() {
        super();

        socketClient.on('lookup_user', s => this.updatePersonalEmotes(s));
        watcher.on('load.chat', () => this.joinChannel());
    }

    get provider() {
        return provider;
    }

    getEligibleEmote(code, user) {
        if (!user) return;

        const emotes = this.emotes.get(user.name);
        if (!emotes) return;

        return emotes.get(code);
    }

    joinChannel() {
        const {name} = twitch.getCurrentChannel();
        if (name !== joinedChannel) {
            socketClient.partChannel(joinedChannel);
        }

        joinedChannel = name;
        socketClient.joinChannel(name);
    }

    updatePersonalEmotes({name, pro, emotes}) {
        if (!pro) return;

        let personalEmotes = this.emotes.get(name);
        if (!personalEmotes) {
            personalEmotes = new Map();
            this.emotes.set(name, personalEmotes);
        }

        emotes.forEach(({id, channel, code, imageType, urlTemplate}) => {
            personalEmotes.set(code, new Emote({
                id,
                provider: this.provider,
                channel: {name: channel},
                code,
                images: {
                    '1x': mustacheFormat(urlTemplate, {id, image: '1x'}),
                    '2x': mustacheFormat(urlTemplate, {id, image: '2x'}),
                    '4x': mustacheFormat(urlTemplate, {id, image: '3x'})
                },
                imageType
            }));
        });
    }
}

module.exports = new PersonalEmotes();
