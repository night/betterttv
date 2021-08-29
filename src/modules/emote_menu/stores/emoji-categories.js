import Icons from '../components/Icons.jsx';
import emoji from '../../emotes/emojis.js';
import {emotesCategoryIds} from '../../../constants.js';

const emojiByCategory = emoji.getEmotesByCategory();

export default [
  {
    provider: {
      id: emotesCategoryIds.EMOJI_PEOPLE,
      displayName: 'People',
      icon: Icons.PEOPLE,
    },
    emotes: emojiByCategory.people,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_NATURE,
      displayName: 'Nature',
      icon: Icons.LEAF,
    },
    emotes: emojiByCategory.nature,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_FOODS,
      displayName: 'Foods',
      icon: Icons.ICE_CREAM,
    },
    emotes: emojiByCategory.food,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_ACTIVITIES,
      displayName: 'Activities',
      icon: Icons.BASKET_BALL,
    },
    emotes: emojiByCategory.activity,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_TRAVEL,
      displayName: 'Travel',
      icon: Icons.PLANE,
    },
    emotes: emojiByCategory.travel,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_OBJECTS,
      displayName: 'Objects',
      icon: Icons.BOX,
    },
    emotes: emojiByCategory.objects,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_SYMBOLS,
      displayName: 'Symbols',
      icon: Icons.HEART,
    },
    emotes: emojiByCategory.symbols,
  },
  {
    provider: {
      id: emotesCategoryIds.EMOJI_FLAGS,
      displayName: 'Flags',
      icon: Icons.FLAG,
    },
    emotes: emojiByCategory.flags,
  },
];
