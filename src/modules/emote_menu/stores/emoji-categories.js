import twemoji from 'twemoji';
import cdn from '../../../utils/cdn.js';
import emojiBlacklist from '../../../utils/emoji-blacklist.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';
// file gets created during bundle
// eslint-disable-next-line import/no-unresolved
import emojiByCategory from './emojis-by-category.json';

console.log(emojiByCategory);

const emojiCategories = [
  {
    provider: {
      id: 'bttv-emoji-people',
      displayName: 'People',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.PEOPLE,
    },
    emotes: emojiByCategory.people,
  },
  {
    provider: {
      id: 'bttv-emoji-nature',
      displayName: 'Nature',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.LEAF,
    },
    emotes: emojiByCategory.nature,
  },
  {
    provider: {
      id: 'bttv-emoji-food',
      displayName: 'Foods',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.ICE_CREAM,
    },
    emotes: emojiByCategory.food,
  },
  {
    provider: {
      id: 'bttv-emoji-activity',
      displayName: 'Activities',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.BASKET_BALL,
    },
    emotes: emojiByCategory.activity,
  },
  {
    provider: {
      id: 'bttv-emoji-travel',
      displayName: 'Travel',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.PLANE,
    },
    emotes: emojiByCategory.travel,
  },
  {
    provider: {
      id: 'bttv-emoji-objects',
      displayName: 'Objects',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.BOX,
    },
    emotes: emojiByCategory.objects,
  },
  {
    provider: {
      id: 'bttv-emoji-symbols',
      displayName: 'Symbols',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.HEART,
    },
    emotes: emojiByCategory.symbols,
  },
  {
    provider: {
      id: 'bttv-emoji-flags',
      displayName: 'Flags',
      badge: cdn.url('tags/developer.png'),
      icon: Icons.FLAG,
    },
    emotes: emojiByCategory.flags,
  },
];

function countEmojis(emoji) {
  let count = 0;
  twemoji.parse(emoji.char, (d) => {
    count += d.split('-').length;
  });
  return count;
}

function parseEmotes(emojiBySlug, provider) {
  return Object.values(emojiBySlug)
    .filter((emoji) => emojiBlacklist.indexOf(emoji.char) === -1 && countEmojis(emoji) === 1)
    .map((emoji, index) => {
      let url;

      twemoji.parse(emoji.char, {
        callback: (icon, options) => {
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

      if (!url) return false;

      const code = `:${emoji.slug}:`;

      return new Emote({
        id: index,
        provider,
        code,
        images: {
          '1x': url,
        },
      });
    })
    .filter((emote) => emote);
}

const categories = emojiCategories.map(({provider, emotes}) => ({provider, emotes: parseEmotes(emotes, provider)}));

export default categories;
