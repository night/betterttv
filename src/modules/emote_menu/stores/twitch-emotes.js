/* eslint-disable import/prefer-default-export */
import twitchApi from '../../../utils/twitch-api.js';
import Emote from '../../emotes/emote.js';
import Icons from '../components/Icons.jsx';
import debug from '../../../utils/debug.js';
import {getEmoteFromRegEx} from '../../../utils/regex.js';

const EMOTE_SET_QUERY = `
query UserEmotes {
  currentUser {
    emoteSets {
      emotes {
        id,
        token
      },
      id,
      owner {
        id,
        displayName
        profileImageURL(width: 300)
      }
    }
  }
}
`;

const TWITCH_EMOTE_CDN = (id, size) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/${size}`;

function getForcedProviderToChannels(key) {
  switch (key) {
    case '0':
      return {
        id: 'twitch-global',
        displayName: 'Twitch Global',
        icon: Icons.TWITCH,
      };
    case '33':
      return {
        id: 'twitch-turbo',
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '42':
      return {
        id: 'twitch-turbo',
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '457':
      return {
        id: 'twitch-turbo',
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '793':
      return {
        id: 'twitch-turbo',
        displayName: 'Twitch Turbo',
        icon: Icons.PEOPLE,
      };
    case '19151':
      return {
        id: 'twitch-gaming',
        displayName: 'Twitch Gaming',
        icon: Icons.TWITCH_GAMING,
      };
    case '19194':
      return {
        id: 'twitch-gaming',
        displayName: 'Twitch Gaming',
        icon: Icons.TWITCH_GAMING,
      };
    default:
      return {
        id: 'unlocked',
        displayName: 'Unlocked',
        icon: Icons.UNLOCK,
      };
  }
}

export async function loadTwitchEmotes() {
  try {
    const tempSets = {};
    const {data} = await twitchApi.graphqlQuery(EMOTE_SET_QUERY);

    for (const {owner, id, emotes} of data.currentUser.emoteSets) {
      let provider = getForcedProviderToChannels(id);

      if (provider.id === -1 && owner != null) {
        provider = {
          id: owner.id,
          displayName: owner.displayName,
          icon: Icons.IMAGE(owner.profileImageURL, owner.displayName),
        };
      }

      const providerEmotes = emotes.map(({id: emoteId, token: emoteToken}) => {
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
            '1x': TWITCH_EMOTE_CDN(emoteId, '1.0'),
            '2x': TWITCH_EMOTE_CDN(emoteId, '2.0'),
            '4x': TWITCH_EMOTE_CDN(emoteId, '3.0'),
          },
        });
      });

      // twitch seperates emotes by tier, so we merge them into one set
      // eslint-disable-next-line no-prototype-builtins
      if (tempSets.hasOwnProperty(provider.id)) {
        tempSets[provider.id].emotes = [...tempSets[provider.id]?.emotes, ...providerEmotes];
        continue;
      }

      tempSets[provider.id] = {provider, emotes: providerEmotes};
    }

    return Object.values(tempSets);
  } catch (e) {
    debug.error('failed to fetch twitch', e);
    return [];
  }
}
