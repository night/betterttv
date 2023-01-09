import twemoji from 'twemoji';
import blacklistedEmoji from '../../utils/emoji-blacklist.js';

import AbstractEmotes from './abstract-emotes.js';
import Emote from './emote.js';
import {EmoteCategories, EmoteProviders} from '../../constants.js';
import formatMessage from '../../i18n/index.js';

// file gets created during bundle
// eslint-disable-next-line import/no-unresolved
import emojiBySlug from './emojis-by-slug.json';

const category = {
  id: EmoteCategories.BETTERTTV_EMOJI,
  provider: EmoteProviders.BETTERTTV,
  displayName: formatMessage({defaultMessage: 'BetterTTV Emojis'}),
};

function countEmojis(emoji) {
  let count = 0;
  twemoji.parse(emoji.char, (d) => {
    count += d.split('-').length;
  });
  return count;
}

class Emojis extends AbstractEmotes {
  constructor() {
    super();

    this.emotesByCategory = {};
    this.loadEmojis();
  }

  get category() {
    return category;
  }

  getEmotesByCategory() {
    return this.emotesByCategory;
  }

  loadEmojis() {
    Object.values(emojiBySlug)
      .filter((emoji) => blacklistedEmoji.indexOf(emoji.char) === -1 && countEmojis(emoji) === 1)
      .forEach((emoji) => {
        let url;

        twemoji.parse(emoji.char, {
          base: process.env.CDN_ENDPOINT,
          folder: 'assets/emoji',
          ext: '.svg',
          callback: (icon, options) => {
            if (icon.length === 0) {
              return false;
            }

            switch (icon) {
              case 'a9': // ©
              case 'ae': // ®
              case '2122': // ™
                return false;
              default:
                break;
            }

            url = ''.concat(options.base, options.size, '/', icon, options.ext);

            return false;
          },
        });

        if (!url) return;

        const code = `:${emoji.slug}:`;
        const emote = new Emote({
          id: emoji.char,
          category: this.category,
          code,
          images: {
            '1x': url,
          },
        });

        if (!emoji.isAlternative) {
          // eslint-disable-next-line no-prototype-builtins
          let categoryEmotes = this.emotesByCategory[emoji.category];

          if (categoryEmotes == null) {
            categoryEmotes = [];
            this.emotesByCategory[emoji.category] = categoryEmotes;
          }
          categoryEmotes.push(emote);
        }

        this.emotes.set(emoji.char, emote);
        this.emotes.set(code, emote);
      });
  }

  onSendMessage(sendState) {
    sendState.message = sendState.message
      .split(' ')
      .map((piece) => {
        if (piece.charAt(0) !== ':' || piece.charAt(piece.length - 1) !== ':') return piece;
        const emoji = emojiBySlug[piece.replace(/:/g, '')];
        return emoji ? emoji.char : piece;
      })
      .join(' ');
  }
}

export default new Emojis();
