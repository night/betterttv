const emojilib = require('emojilib');
const twemoji = require('twemoji');
const blacklistedEmoji = require('../../utils/emoji-blacklist.json');
const cdn = require('../../utils/cdn');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');

const provider = {
    id: 'bttv-emoji',
    displayName: 'BetterTTV Emojis',
    badge: cdn.url('tags/developer.png')
};

function countEmojis(emoji) {
    let count = 0;
    twemoji.parse(emoji.char, d => {
        count += d.split('-').length;
    });
    return count;
}

class Emojis extends AbstractEmotes {
    constructor() {
        super();

        this.loadEmojis();
    }

    get provider() {
        return provider;
    }

    loadEmojis() {
        Object.keys(emojilib.lib)
            .filter(key => {
                const emoji = emojilib.lib[key];
                if (!emoji || !emoji.char) return false;
                const emojiCount = countEmojis(emoji);
                return blacklistedEmoji.indexOf(emoji.char) === -1 &&
                    emoji.category !== '_custom' &&
                    emojiCount === 1;
            })
            .forEach((key, id) => {
                const emoji = emojilib.lib[key];
                let url;

                twemoji.parse(emoji.char, {
                    callback: (icon, options) => {
                        switch (icon) {
                            case 'a9': // ©
                            case 'ae': // ®
                            case '2122': // ™
                                return false;
                        }

                        url = ''.concat(options.base, options.size, '/', icon, options.ext);

                        return false;
                    }
                });

                if (!url) return;

                const code = `:${key}:`;
                const emote = new Emote({
                    id,
                    provider: this.provider,
                    code,
                    images: {
                        '1x': url
                    }
                });

                this.emotes.set(emoji.char, emote);
                this.emotes.set(code, emote);
            });
    }

    onSendMessage(sendState) {
        sendState.message = sendState.message.split(' ').map(piece => {
            if (piece.charAt(0) !== ':' || piece.charAt(piece.length - 1) !== ':') return piece;
            const emoji = emojilib.ordered[emojilib.ordered.indexOf(piece.replace(/:/g, ''))];
            if (!emoji || !emojilib.lib[emoji]) return piece;
            return emojilib.lib[emoji].char;
        }).join(' ');
    }
}

module.exports = new Emojis();
