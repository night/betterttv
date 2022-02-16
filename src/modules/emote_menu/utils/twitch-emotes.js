/* eslint-disable import/prefer-default-export */
import uniqBy from 'lodash.uniqby';
import sortBy from 'lodash.sortby';
import twitchApi from '../../../utils/twitch-api.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';
import debug from '../../../utils/debug.js';
import {getEmoteFromRegEx} from '../../../utils/regex.js';
import settings from '../../../settings.js';
import {SettingIds, EmoteCategories, EmoteProviders} from '../../../constants.js';
import {getCurrentChannel} from '../../../utils/channel.js';
import twitch from '../../../utils/twitch.js';

const AVAILABLE_EMOTES_FOR_CHANNEL_QUERY = `
  query AvailableEmotesForChannel($channelID: ID!) {
    user(id: $channelID) {
      id,
      displayName,
      profileImageURL(width: 300)
      subscriptionProducts {
        id,
        emotes {
          id,
          token,
          type
        }
        owner {
          id,
          displayName,
          profileImageURL(width: 300)
        }
      }
    }
    channel(id: $channelID) {
      localEmoteSets {
        id,
        emotes {
          id,
          token,
          type
        },
        owner {
          id,
          displayName,
          profileImageURL(width: 300)
        }
      },
      self {
        availableEmoteSets {
          id,
          emotes {
            id,
            token,
            type
          },
          owner {
            id,
            displayName,
            profileImageURL(width: 300)
          }
        }
      }
    }
  }
`;

const TWITCH_EMOTE_CDN = (id, size, isDark = true) =>
  `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/${isDark ? 'dark' : 'light'}/${size}`;

function getCategoryForSet(setId, owner) {
  switch (setId) {
    case '0':
      return {
        id: EmoteCategories.TWITCH_GLOBAL,
        provider: EmoteProviders.TWITCH,
        displayName: 'Twitch Global',
        icon: Icons.TWITCH,
      };
    case '33':
    case '42':
    case '457':
    case '793':
      return {
        id: EmoteCategories.TWITCH_TURBO,
        provider: EmoteProviders.TWITCH,
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '19151':
    case '19194':
      return {
        id: EmoteCategories.TWITCH_GAMING,
        provider: EmoteProviders.TWITCH,
        displayName: 'Twitch Gaming',
        icon: Icons.TWITCH_GAMING,
      };
    default:
      if (owner != null) {
        return {
          id: EmoteCategories.TWITCH_CHANNEL(owner.id),
          provider: EmoteProviders.TWITCH,
          displayName: owner.displayName,
          icon: Icons.IMAGE(owner.profileImageURL, owner.displayName),
        };
      }

      return {
        id: EmoteCategories.TWITCH_UNLOCKED,
        provider: EmoteProviders.TWITCH,
        displayName: 'Unlocked',
        icon: Icons.UNLOCK,
      };
  }
}

export async function loadTwitchEmotes() {
  let data = [];

  const currentChannel = getCurrentChannel();
  if (currentChannel == null || currentChannel.provider !== 'twitch') {
    return [];
  }

  try {
    [{data}] = await twitchApi.graphqlQuery([
      {
        query: AVAILABLE_EMOTES_FOR_CHANNEL_QUERY,
        variables: {
          channelID: currentChannel.id,
        },
      },
    ]);
  } catch (e) {
    debug.log('failed to fetch twitch emotes', e);
    return data;
  }

  const isDark = settings.get(SettingIds.DARKENED_MODE);
  const tempCategories = {};

  const subscriptionProducts = data.user.subscriptionProducts.map(({emotes, ...rest}) => ({
    ...rest,
    emotes: emotes.map((emote) => ({
      ...emote,
      locked: true,
    })),
  }));

  const localEmoteSets = data.channel.localEmoteSets.map(({emotes, ...rest}) => ({
    ...rest,
    emotes: emotes.map((emote) => ({
      ...emote,
      locked: true,
    })),
  }));

  for (const {owner, id: setId, emotes} of [
    ...data.channel.self.availableEmoteSets,
    ...subscriptionProducts,
    ...localEmoteSets,
  ]) {
    const category = getCategoryForSet(setId, owner);
    const categoryEmotes = emotes.map((emote) => {
      const {id: emoteId, token: emoteToken, type, locked = false} = emote;
      let newToken;

      try {
        newToken = getEmoteFromRegEx(emoteToken);
      } catch (e) {
        newToken = emoteToken;
      }

      let predicate = () => false;
      if (['SUBSCRIPTIONS', 'FOLLOWER'].includes(type)) {
        // eslint-disable-next-line react/function-component-definition
        predicate = () => {
          const currentSets = twitch.getCurrentEmotes()?.emoteSets;

          if (currentSets == null) {
            return locked; // twitch's emote set hasn't loaded yet so we supply default locked
          }

          return currentSets.find(({id}) => id === setId) == null;
        };
      }

      return new Emote({
        id: emoteId,
        category,
        channel: owner?.displayName,
        code: newToken,
        images: {
          '1x': TWITCH_EMOTE_CDN(emoteId, '1.0', isDark),
          '2x': TWITCH_EMOTE_CDN(emoteId, '2.0', isDark),
          '4x': TWITCH_EMOTE_CDN(emoteId, '3.0', isDark),
        },
        metadata: {
          type,
          isLocked: predicate,
        },
      });
    });

    tempCategories[category.id] = {
      category,
      // twitch seperates emotes by tier, so we merge them into one set
      // uniqBy also priortises the available emotes over the locked emotes here
      emotes: sortBy(
        uniqBy([...(tempCategories[category.id]?.emotes || []), ...categoryEmotes], 'id'),
        ({code, metadata}) => [metadata.isLocked(), code.toLowerCase()]
      ),
    };
  }

  return sortBy(Object.values(tempCategories), [
    // sort current channel to the top of the categories
    ({category}) => (EmoteCategories.TWITCH_CHANNEL(currentChannel.id) === category.id ? -1 : 1),
    // paid subscription emotes and limited emotes (one time subs) seem more important
    ({emotes}) => (emotes?.some(({metadata}) => ['SUBSCRIPTIONS', 'LIMITED_TIME'].includes(metadata?.type)) ? -1 : 1),
    // do a final sort for alphabetical order
    ({category}) => category.displayName.toLowerCase(),
  ]);
}
