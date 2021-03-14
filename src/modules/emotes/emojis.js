const twemoji = require('twemoji');
const blacklistedEmoji = require('../../utils/emoji-blacklist');
const cdn = require('../../utils/cdn');

const AbstractEmotes = require('./abstract-emotes');
const Emote = require('./emote');
const emojiBySlug = require('./emojis-by-slug.json');

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
        Object.values(emojiBySlug)
            .filter(emoji => blacklistedEmoji.indexOf(emoji.char) === -1 && countEmojis(emoji) === 1)
            .forEach((emoji, index) => {
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

                const code = `:${emoji.slug}:`;
                const emote = new Emote({
                    id: index,
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
            const emoji = emojiBySlug[piece.replace(/:/g, '')];
            return emoji ? emoji.char : piece;
        }).join(' ');
    }
}

module.exports = new Emojis();
