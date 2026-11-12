import gql from 'graphql-tag';
import sortBy from 'lodash.sortby';
import uniqBy from 'lodash.uniqby';
import {SettingIds, EmoteCategories, EmoteProviders} from '@/constants';
import Icons from '@/modules/emote_menu/components/Icons';
import LegendaryEmotesEntrypoint from '@/modules/emote_menu/twitch/LegendaryEmotesEntrypoint';
import Emote from '@/modules/emotes/emote';
import settings from '@/settings';
import {getCurrentChannel} from '@/utils/channel';
import debug from '@/utils/debug';
import {getEmoteFromRegEx} from '@/utils/regex';
import twitch from '@/utils/twitch';

const AVAILABLE_EMOTES_FOR_CHANNEL_QUERY = gql`
  query BTTVAvailableEmotesForChannel($channelID: ID!) {
    user(id: $channelID) {
      id
      displayName
      profileImageURL(width: 300)
      subscriptionProducts {
        id
        emoteSetID
        emotes {
          id
          token
          type
          assetType
        }
        owner {
          id
          displayName
          profileImageURL(width: 300)
        }
      }
    }
    channel(id: $channelID) {
      id
      localEmoteSets {
        id
        emotes {
          id
          token
          type
          assetType
        }
        owner {
          id
          displayName
          profileImageURL(width: 300)
        }
      }
      self {
        availableEmoteSets {
          id
          emotes {
            id
            token
            type
            assetType
          }
          owner {
            id
            displayName
            profileImageURL(width: 300)
          }
        }
      }
    }
  }
`;

const TWITCH_EMOTE_CDN = (id, size, isDark = true, static_ = false) =>
  `https://static-cdn.jtvnw.net/emoticons/v2/${id}/${static_ ? 'static' : 'default'}/${
    isDark ? 'dark' : 'light'
  }/${size}`;

// twitch's emote type for legendary emotes. owned ones arrive in ownerless sets, so we fold them into
// twitch global next to the base legendary emotes
const COLLECTIONS_EMOTE_TYPE = 'COLLECTIONS';

function getCategoryForSet(setId, owner) {
  switch (setId) {
    case '0':
      return {
        id: EmoteCategories.TWITCH_GLOBAL,
        provider: EmoteProviders.TWITCH,
        displayName: 'Twitch Global',
        icon: Icons.TWITCH,
        // links to the channel's legendary emotes collection, when it has one
        HeaderAccessory: LegendaryEmotesEntrypoint,
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

function isLocked(setId, defaultValue) {
  const currentSets = twitch.getCurrentEmotes()?.emoteSets;

  if (currentSets == null) {
    return defaultValue; // twitch's emote set hasn't loaded yet so we supply default locked
  }

  return currentSets.find(({id}) => id === setId) == null;
}

export async function loadTwitchEmotes() {
  let data = [];

  const currentChannel = getCurrentChannel();
  if (currentChannel == null || currentChannel.provider !== 'twitch') {
    return [];
  }

  try {
    const result = await twitch.graphqlQuery(AVAILABLE_EMOTES_FOR_CHANNEL_QUERY, {
      channelID: currentChannel.id,
    });
    data = result.data;
  } catch (e) {
    debug.log('failed to fetch twitch emotes', e);
    return data;
  }

  const isDark = settings.get(SettingIds.DARKENED_MODE);
  const tempCategories = {};

  const subscriptionProducts = data.user?.subscriptionProducts ?? [];
  const localEmoteSets = data.channel?.localEmoteSets ?? [];
  const channelSelfAvailableEmoteSets = data.channel?.self?.availableEmoteSets ?? [];

  const channelProducts = [...subscriptionProducts, ...localEmoteSets].map(({id, emoteSetID, ...rest}) => ({
    id: emoteSetID == null ? id : emoteSetID,
    ...rest,
    product: true,
  }));

  for (const {owner, id: setId, emotes, product = false} of [...channelSelfAvailableEmoteSets, ...channelProducts]) {
    const category = getCategoryForSet(setId, owner);
    const locked = product && channelSelfAvailableEmoteSets.find(({id}) => id === setId) == null;

    const emotesByCategory = {};

    for (const emote of emotes) {
      const {id: emoteId, token: emoteToken, type, assetType} = emote;
      let newToken;

      try {
        newToken = getEmoteFromRegEx(emoteToken);
      } catch (e) {
        newToken = emoteToken;
      }

      let predicate = () => false;
      if (product) {
        predicate = isLocked.bind(this, setId, locked);
      }

      const animated = assetType === 'ANIMATED';

      const isLegendary = type === COLLECTIONS_EMOTE_TYPE;
      const emoteCategory = isLegendary ? getCategoryForSet('0') : category;

      const categoryEmote = new Emote({
        id: emoteId,
        category: emoteCategory,
        // legendary emotes belong to twitch's placeholder account rather than a real channel
        channel: isLegendary ? undefined : owner?.displayName,
        code: newToken,
        images: {
          '1x': TWITCH_EMOTE_CDN(emoteId, '1.0', isDark),
          '2x': TWITCH_EMOTE_CDN(emoteId, '2.0', isDark),
          '4x': TWITCH_EMOTE_CDN(emoteId, '3.0', isDark),
          '1x_static': animated ? TWITCH_EMOTE_CDN(emoteId, '1.0', isDark, true) : undefined,
          '2x_static': animated ? TWITCH_EMOTE_CDN(emoteId, '2.0', isDark, true) : undefined,
          '4x_static': animated ? TWITCH_EMOTE_CDN(emoteId, '3.0', isDark, true) : undefined,
        },
        animated,
        metadata: {
          type,
          isLocked: predicate,
        },
      });

      emotesByCategory[emoteCategory.id] ??= {category: emoteCategory, emotes: []};
      emotesByCategory[emoteCategory.id].emotes.push(categoryEmote);
    }

    for (const {category: emoteCategory, emotes: categoryEmotes} of Object.values(emotesByCategory)) {
      tempCategories[emoteCategory.id] = {
        category: emoteCategory,
        // twitch seperates emotes by tier, so we merge them into one set
        // uniqBy also priortises the available emotes over the locked emotes here
        emotes: sortBy(
          uniqBy([...(tempCategories[emoteCategory.id]?.emotes || []), ...categoryEmotes], 'id'),
          ({code, metadata}) => [metadata.isLocked(), code.toLowerCase()]
        ),
      };
    }
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
