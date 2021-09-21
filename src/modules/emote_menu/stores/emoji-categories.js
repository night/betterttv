import Icons from '../components/Icons.jsx';
import emoji from '../../emotes/emojis.js';
import {EmoteCategories, EmoteProviders} from '../../../constants.js';

const emojiByCategory = emoji.getEmotesByCategory();

export default [
  {
    category: {
      id: EmoteCategories.EMOJI_PEOPLE,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'People',
      icon: Icons.PEOPLE,
    },
    emotes: emojiByCategory.people,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_NATURE,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Nature',
      icon: Icons.LEAF,
    },
    emotes: emojiByCategory.nature,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_FOODS,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Foods',
      icon: Icons.ICE_CREAM,
    },
    emotes: emojiByCategory.food,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_ACTIVITIES,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Activities',
      icon: Icons.BASKET_BALL,
    },
    emotes: emojiByCategory.activity,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_TRAVEL,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Travel',
      icon: Icons.PLANE,
    },
    emotes: emojiByCategory.travel,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_OBJECTS,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Objects',
      icon: Icons.BOX,
    },
    emotes: emojiByCategory.objects,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_SYMBOLS,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Symbols',
      icon: Icons.HEART,
    },
    emotes: emojiByCategory.symbols,
  },
  {
    category: {
      id: EmoteCategories.EMOJI_FLAGS,
      provider: EmoteProviders.BETTERTTV,
      displayName: 'Flags',
      icon: Icons.FLAG,
    },
    emotes: emojiByCategory.flags,
  },
];
