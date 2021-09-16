/* eslint-disable import/prefer-default-export */
import uniqby from 'lodash.uniqby';
import sortby from 'lodash.sortby';
import twitchApi from '../../../utils/twitch-api.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';
import debug from '../../../utils/debug.js';
import {getEmoteFromRegEx} from '../../../utils/regex.js';
import settings from '../../../settings.js';
import {SettingIds, emotesCategoryIds} from '../../../constants.js';
import {getCurrentChannel} from '../../../utils/channel.js';

const AVAILABLE_EMOTES_FOR_CHANNEL_QUERY = `
  query AvailableEmotesForChannel($channelID: ID!) {
    channel(id: $channelID) {
      self {
        availableEmoteSets {
          emotes {
            id,
            token,
            type
          },
          id,
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

function getForcedProviderToChannels(key) {
  switch (key) {
    case '0':
      return {
        id: `${emotesCategoryIds.TWITCH}-global`,
        displayName: 'Twitch Global',
        icon: Icons.TWITCH,
      };
    case '33':
      return {
        id: `${emotesCategoryIds.TWITCH}-turbo`,
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '42':
      return {
        id: `${emotesCategoryIds.TWITCH}-turbo`,
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '457':
      return {
        id: `${emotesCategoryIds.TWITCH}-turbo`,
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '793':
      return {
        id: `${emotesCategoryIds.TWITCH}-turbo`,
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '19151':
      return {
        id: `${emotesCategoryIds.TWITCH}-twitch-gaming`,
        displayName: 'Twitch Gaming',
        icon: Icons.TWITCH_GAMING,
      };
    case '19194':
      return {
        id: `${emotesCategoryIds.TWITCH}-twitch-gaming`,
        displayName: 'Twitch Gaming',
        icon: Icons.TWITCH_GAMING,
      };
    default:
      return null;
  }
}

export async function loadTwitchEmotes() {
  let data = [];

  const currentChannel = getCurrentChannel();
  if (currentChannel == null || currentChannel.provider !== 'twitch') {
    return [];
  }

  try {
    const [availableEmotesResponse] = await twitchApi.graphqlQuery([
      {query: AVAILABLE_EMOTES_FOR_CHANNEL_QUERY, variables: {channelID: currentChannel.id}},
    ]);
    data = availableEmotesResponse.data;
  } catch (e) {
    debug.log('failed to fetch twitch emotes', e);
    return data;
  }

  const isDark = settings.get(SettingIds.DARKENED_MODE);
  const tempSets = {};

  for (const {owner, id, emotes} of data.channel.self.availableEmoteSets) {
    let provider = getForcedProviderToChannels(id);

    if (provider == null && owner != null) {
      provider = {
        id: `${emotesCategoryIds.TWITCH}-${owner.id}`,
        displayName: owner.displayName,
        icon: Icons.IMAGE(owner.profileImageURL, owner.displayName),
      };
    }

    if (provider == null && owner == null) {
      provider = {
        id: `${emotesCategoryIds.TWITCH}-unlocked`,
        displayName: 'Unlocked',
        icon: Icons.UNLOCK,
      };
    }

    const providerEmotes = emotes.map(({id: emoteId, token: emoteToken, type}) => {
      let newToken;

      try {
        newToken = getEmoteFromRegEx(emoteToken);
      } catch (e) {
        newToken = emoteToken;
      }

      return new Emote({
        id: emoteId,
        provider,
        channel: owner?.displayName,
        code: newToken,
        images: {
          '1x': TWITCH_EMOTE_CDN(emoteId, '1.0', isDark),
          '2x': TWITCH_EMOTE_CDN(emoteId, '2.0', isDark),
          '4x': TWITCH_EMOTE_CDN(emoteId, '3.0', isDark),
        },
        metadata: {type},
      });
    });

    // twitch seperates emotes by tier, so we merge them into one set
    // eslint-disable-next-line no-prototype-builtins
    if (tempSets.hasOwnProperty(provider.id)) {
      tempSets[provider.id].emotes = uniqby([...tempSets[provider.id]?.emotes, ...providerEmotes], 'id');
      continue;
    }

    tempSets[provider.id] = {provider, emotes: uniqby(providerEmotes, 'id')};
  }

  return sortby(Object.values(tempSets), [
    // sort current channel to the top of the sets
    (set) => (`${emotesCategoryIds.TWITCH}-${currentChannel.id}` === set.provider.id ? -1 : 1),
    // paid subscription emotes and limited emotes (one time subs) seem more important
    (set) => {
      switch (set.emotes?.[0].metadata?.type) {
        case 'SUBSCRIPTIONS':
        case 'LIMITED_TIME':
          return -1;
        default:
          return 1;
      }
    },
    // do a final sort for alphabetical order
    (set) => set.provider.displayName.toLowerCase(),
  ]);
}
