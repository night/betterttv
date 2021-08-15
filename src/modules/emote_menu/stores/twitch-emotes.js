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

const forcedProvidersToChannels = {
  0: {
    id: 0,
    displayName: 'Twitch Global',
    icon: Icons.PEOPLE,
  },
  33: {
    id: 33,
    displayName: 'Twitch Turbo',
    icon: Icons.PEOPLE,
  },
  42: {
    id: 42,
    displayName: 'Twitch Turbo',
    icon: Icons.PEOPLE,
  },
  457: {
    id: 457,
    displayName: 'Twitch Turbo',
    icon: Icons.PEOPLE,
  },
  793: {
    id: 793,
    displayName: 'Twitch Turbo',
    icon: Icons.PEOPLE,
  },
  19151: {
    id: 19151,
    displayName: 'Twitch Prime',
    icon: Icons.CROWN,
  },
  19194: {
    id: 19194,
    displayName: 'Twitch Prime',
    icon: Icons.CROWN,
  },
  301592777: {
    id: 301592777,
    displayName: 'Unlocked',
    icon: Icons.UNLOCK,
  },
  300374282: {
    id: 300374282,
    displayName: 'Unlocked',
    icon: Icons.UNLOCK,
  },
};

class TwitchEmotes {
  constructor() {
    this.sets = [];
    this.loadEmotes();
  }

  getEmoteSets() {
    return this.sets;
  }

  async loadEmotes() {
    try {
      const tempSets = {};
      const {data} = await twitchApi.graphqlQuery(EMOTE_SET_QUERY);

      for (const {owner, id, emotes: channelEmotes} of data.currentUser.emoteSets) {
        let provider = forcedProvidersToChannels[id];

        if (provider == null) {
          provider = {
            id: owner?.id,
            displayName: owner?.displayName,
            icon: Icons.IMAGE(owner?.profileImageURL, owner?.displayName),
          };
        }

        const emotes = channelEmotes.map(({id: emoteId, token: emoteToken}) => {
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
          tempSets[provider.id].emotes = [...tempSets[provider.id]?.emotes, ...emotes];
          continue;
        }

        tempSets[provider.id] = {provider, emotes};
      }

      this.sets = Object.values(tempSets);
    } catch (e) {
      debug.error('failed to fetch twitch', e);
    }
  }
}

export default new TwitchEmotes();
