import Icons from '../components/Icons.jsx';
import emoji from '../../emotes/emojis.js';

const emojiByCategory = emoji.getEmotesByCategory();

export default [
  {
    provider: {
      id: 'bttv-emoji-people',
      displayName: 'People',
      icon: Icons.PEOPLE,
    },
    emotes: emojiByCategory.people,
  },
  {
    provider: {
      id: 'bttv-emoji-nature',
      displayName: 'Nature',
      icon: Icons.LEAF,
    },
    emotes: emojiByCategory.nature,
  },
  {
    provider: {
      id: 'bttv-emoji-food',
      displayName: 'Foods',
      icon: Icons.ICE_CREAM,
    },
    emotes: emojiByCategory.food,
  },
  {
    provider: {
      id: 'bttv-emoji-activity',
      displayName: 'Activities',
      icon: Icons.BASKET_BALL,
    },
    emotes: emojiByCategory.activity,
  },
  {
    provider: {
      id: 'bttv-emoji-travel',
      displayName: 'Travel',
      icon: Icons.PLANE,
    },
    emotes: emojiByCategory.travel,
  },
  {
    provider: {
      id: 'bttv-emoji-objects',
      displayName: 'Objects',
      icon: Icons.BOX,
    },
    emotes: emojiByCategory.objects,
  },
  {
    provider: {
      id: 'bttv-emoji-symbols',
      displayName: 'Symbols',
      icon: Icons.HEART,
    },
    emotes: emojiByCategory.symbols,
  },
  {
    provider: {
      id: 'bttv-emoji-flags',
      displayName: 'Flags',
      icon: Icons.FLAG,
    },
    emotes: emojiByCategory.flags,
  },
];
